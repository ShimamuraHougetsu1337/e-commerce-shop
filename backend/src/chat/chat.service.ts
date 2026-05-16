import OpenAI from 'openai';
import { GatewayTimeoutException, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama không yêu cầu key
    });
  }

  async generateChatStream(userMessage: string) {
    try {
      // 1. KEYWORD EXTRACTION (Dùng AI lọc từ khóa để tìm kiếm chính xác hơn)
      const keywordResponse = await this.openai.chat.completions.create({
        model: 'qwen3:4b-instruct',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia trích xuất thực thể. Chỉ trả về duy nhất tên sản phẩm chính hoặc loại sản phẩm từ câu hỏi của người dùng. Không giải thích, không chào hỏi. Nếu không tìm thấy, trả về toàn bộ câu hỏi. Ví dụ: "Tôi muốn mua đèn LED" -> "đèn LED"'
          },
          { role: 'user', content: userMessage }
        ],
        temperature: 0,
      });

      const searchText = keywordResponse.choices[0]?.message?.content?.trim() || userMessage;

      // 2. RETRIEVAL (Truy xuất sản phẩm dựa trên từ khóa đã lọc)
      const products = await this.productModel
        .find({
          name: {
            $regex: searchText,
            $options: 'i'
          },
          isActive: true,
          isDeleted: false
        })
        .select('name price short_description averageRating totalReviews stock_quantity')
        .sort({ averageRating: -1 })
        .limit(5)
        .lean()
        .exec();

      // 2. AUGMENTATION (Tạo ngữ cảnh nén dữ liệu để tiết kiệm token)
      let context = 'Không có sản phẩm nào khớp.';
      if (products.length > 0) {
        context = products
          .map((p) => {
            const desc = p.short_description ? p.short_description.substring(0, 100) + '...' : '';
            const stockStatus = p.stock_quantity > 0 ? `Còn ${p.stock_quantity} sp` : 'HẾT HÀNG';
            const rating = p.averageRating > 0 ? `${p.averageRating}⭐ (${p.totalReviews} ĐG)` : 'Mới';

            return `- ${p.name} | ${p.price}đ | ${rating} | ${stockStatus} | TT: ${desc}`;
          })
          .join('\n');
      }

      // 3. SYSTEM PROMPT (Thiết lập tính cách nhân viên tư vấn)
      const prompt = `Bạn là nhân viên tư vấn bán hàng dễ thương của E-Commerce.
Dữ liệu sản phẩm hiện có:
${context}

Khách hàng hỏi: "${userMessage}"

Quy tắc xử lý:
1. Trả lời cực kỳ ngắn gọn (dưới 50 chữ), thân thiện, xưng hô "dạ/em".
2. Nếu khách hỏi mua sản phẩm:
   - Dựa CHỈ vào dữ liệu trên để tư vấn. Không bịa sản phẩm.
   - Nêu bật đánh giá sao để tăng uy tín.
   - Nếu HẾT HÀNG hãy xin lỗi khéo léo. Nếu còn ít (dưới 5) hãy giục khách mua.
   - Nếu dữ liệu ghi "Không có sản phẩm nào khớp", hãy nhẹ nhàng báo hết hàng hoặc hỏi khách muốn tìm mẫu khác không.
3. Nếu khách CÓ Ý CHÀO HỎI hoặc NÓI CHUYỆN NGOÀI LỀ (không liên quan đến tìm mua hàng):
   - Hãy chào lại hoặc trả lời thân thiện, sau đó khéo léo lái câu chuyện về việc "Dạ em có thể giúp anh/chị tìm sản phẩm gì ạ?". 
   - Không được đề cập đến việc "không tìm thấy sản phẩm" trong trường hợp này.`;

      // 4. GENERATION (Sử dụng Qwen3 qua Ollama)
      try {
        const stream = await this.openai.chat.completions.create({
          model: 'qwen3:4b-instruct',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: userMessage }
          ],
          stream: true,
        });

        // Tạo một generator để chuẩn hóa đầu ra là string
        async function* streamGenerator() {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) yield content;
          }
        }

        return streamGenerator();
      } catch (error: any) {
        console.error('Ollama/Qwen3 Error:', error);
        throw new InternalServerErrorException('AI_GENERIC_ERROR');
      }
    } catch (error) {
      if (error instanceof GatewayTimeoutException || error instanceof ServiceUnavailableException) {
        throw error;
      }
      console.error('Chat Service Error:', error);
      throw new InternalServerErrorException('DATABASE_ERROR');
    }
  }
}
