import { GoogleGenerativeAI } from '@google/generative-ai';
import { GatewayTimeoutException, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async generateChatStream(userMessage: string) {
    try {
      // 1. RETRIEVAL (Truy xuất sản phẩm dựa trên Text Search)
      const searchText = userMessage?.trim();

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

      // 4. GENERATION (Sử dụng gemini-pro-latest cho ổn định Quota)
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      // Cơ chế Timeout 10 giây cho cuộc gọi API
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new GatewayTimeoutException('AI_TIMEOUT')), 10000)
      );

      try {
        const result = await Promise.race([
          model.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 150,
            }
          }),
          timeoutPromise
        ]) as any;

        return result.stream;
      } catch (error: any) {
        // Phân loại lỗi để Frontend xử lý UI
        if (error instanceof GatewayTimeoutException) throw error;

        if (error?.status === 429 || error?.message?.includes('429')) {
          throw new ServiceUnavailableException('AI_QUOTA_EXCEEDED');
        }

        console.error('Gemini API Error:', error);
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
