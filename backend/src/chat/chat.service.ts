import OpenAI from 'openai';
import { GatewayTimeoutException, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama không yêu cầu key
    });
  }

  async getChatHistory(userId: string) {
    return await this.chatMessageModel
      .find({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getActiveChats() {
    return await this.chatMessageModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$receiverId", null] },
              "$senderId",
              "$receiverId"
            ]
          },
          lastMessage: { $first: "$content" },
          lastUpdate: { $first: "$createdAt" }
        }
      },
      {
        $addFields: {
          // Ép kiểu _id về ObjectId nếu nó đang là String để lookup chính xác
          userObjectId: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      { $sort: { lastUpdate: -1 } },
      {
        $project: {
          userObjectId: 0
        }
      }
    ]);
  }

  async generateChatStream(
    userMessage: string,
    history?: { role: 'user' | 'assistant'; content: string }[],
  ) {
    try {
      // 1. KEYWORD EXTRACTION (Dùng AI lọc từ khóa và phân tích ngữ cảnh từ lịch sử chat)
      const extractionMessages: any[] = [
        {
          role: 'system',
          content: 'Bạn là chuyên gia phân tích hội thoại và trích xuất thực thể. Nhiệm vụ của bạn là trích xuất tên sản phẩm chính hoặc danh mục sản phẩm từ câu nói hiện tại của người dùng, bằng cách tham khảo ngữ cảnh hội thoại phía trước (nếu có) để giải quyết các đại từ xưng hô hoặc câu hỏi ngắn. Chỉ trả về duy nhất tên sản phẩm chính hoặc loại sản phẩm được nhắm tới trong câu hỏi hiện tại. Không giải thích, không chào hỏi. Nếu không tìm thấy sản phẩm cụ thể nào được nhắc tới hoặc hỏi tới, trả về chuỗi rỗng "". Ví dụ: "Nó giá bao nhiêu?" kết hợp lịch sử nói về "iPhone 15" -> "iPhone 15".'
        }
      ];

      if (history && history.length > 0) {
        history.slice(-4).forEach(h => {
          extractionMessages.push({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content
          });
        });
      }

      extractionMessages.push({ role: 'user', content: userMessage });

      const keywordResponse = await this.openai.chat.completions.create({
        model: 'qwen3:4b-instruct',
        messages: extractionMessages,
        temperature: 0,
      });

      let searchText = keywordResponse.choices[0]?.message?.content?.trim() || '';
      
      // Nếu AI trích xuất trả về rỗng, ta fallback dùng chính userMessage làm từ khóa tìm kiếm sản phẩm
      if (!searchText || searchText === '""') {
        searchText = userMessage;
      }

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
Dữ liệu sản phẩm hiện có dựa trên tìm kiếm gần nhất:
${context}

Quy tắc xử lý:
1. Trả lời cực kỳ ngắn gọn (dưới 50 chữ), thân thiện, xưng hô "dạ/em".
2. Nếu khách hỏi mua sản phẩm hoặc hỏi các câu hỏi liên quan đến sản phẩm (như giá cả, còn hàng không, màu sắc):
   - Dựa CHỈ vào dữ liệu sản phẩm hiện có ở trên để tư vấn. Không tự bịa sản phẩm không tồn tại.
   - Nêu bật đánh giá sao để tăng uy tín.
   - Nếu HẾT HÀNG hãy xin lỗi khéo léo. Nếu còn ít (dưới 5) hãy giục khách mua ngay.
   - Nếu dữ liệu ghi "Không có sản phẩm nào khớp", hãy nhẹ nhàng báo hết hàng hoặc hỏi khách muốn tìm mẫu khác không.
3. Nếu khách CÓ Ý CHÀO HỎI hoặc NÓI CHUYỆN NGOÀI LỀ (không liên quan đến tìm mua hàng):
   - Hãy chào lại hoặc trả lời thân thiện, sau đó khéo léo lái câu chuyện về việc "Dạ em có thể giúp anh/chị tìm sản phẩm gì ạ?". 
   - Không được đề cập đến việc "không tìm thấy sản phẩm" trong trường hợp này.`;

      // 4. GENERATION (Sử dụng Qwen3 qua Ollama với toàn bộ lịch sử trò chuyện)
      const apiMessages: any[] = [{ role: 'system', content: prompt }];

      if (history && history.length > 0) {
        history.slice(-6).forEach(h => {
          apiMessages.push({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content
          });
        });
      }

      // Đưa tin nhắn hiện tại của người dùng vào cuối tin nhắn API nếu chưa có trong history
      const isLastSame = history && history.length > 0 && history[history.length - 1].content === userMessage;
      if (!isLastSame) {
        apiMessages.push({ role: 'user', content: userMessage });
      }

      try {
        const stream = await this.openai.chat.completions.create({
          model: 'qwen3:4b-instruct',
          messages: apiMessages,
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
