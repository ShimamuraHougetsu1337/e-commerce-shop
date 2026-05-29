import OpenAI from 'openai';
import {
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import {
  ChatMessage,
  ChatMessageDocument,
} from './schemas/chat-message.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      baseURL: this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434/v1',
      apiKey: this.configService.get<string>('OLLAMA_API_KEY') || 'ollama',
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await this.openai.models.list({ signal: controller.signal });
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn('[Chat Health] AI chatbot service is offline:', error?.message || error);
      return false;
    }
  }

  async getChatHistory(userId: string) {
    return await this.chatMessageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
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
            $cond: [{ $eq: ['$receiverId', null] }, '$senderId', '$receiverId'],
          },
          lastMessage: { $first: '$content' },
          lastUpdate: { $first: '$createdAt' },
        },
      },
      {
        $addFields: {
          // Ép kiểu _id về ObjectId nếu nó đang là String để lookup chính xác
          userObjectId: { $toObjectId: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      { $sort: { lastUpdate: -1 } },
      {
        $project: {
          userObjectId: 0,
        },
      },
    ]);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Qwen2.5/DeepSeek có thể có chế độ "thinking" — strip toàn bộ <think>...</think> khỏi output */
  private stripThinkingTags(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  /** Phát hiện nhanh câu chào hỏi / nói chuyện ngoài lề để skip bước extraction */
  private isSmallTalk(message: string): boolean {
    const smallTalkPatterns = [
      /^(xin chào|chào|hello|hi|hey|alo|ơi|hế|ê)\b/i,
      /^(cảm ơn|cám ơn|thanks|thank you|tks)\b/i,
      /^(bạn (là|tên|ơi)|em (là|tên|ơi))/i,
      /^(ok|oke|okay|được rồi|rồi|vâng|dạ|ừ)\s*[!.]*$/i,
      /^(tạm biệt|bye|bai|hẹn gặp)/i,
    ];
    return smallTalkPatterns.some((p) => p.test(message.trim()));
  }

  /**
   * Trích xuất từ khóa sản phẩm bằng AI, xử lý context hội thoại.
   * Trả về null nếu không cần tìm sản phẩm (câu chào hỏi, ngoài lề).
   */
  private async extractSearchKeyword(
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string | null> {
    // Nhanh: bỏ qua extraction nếu rõ ràng là small talk
    if (this.isSmallTalk(userMessage)) return null;

    const extractionMessages: any[] = [
      {
        role: 'system',
        content: `Bạn là công cụ trích xuất từ khóa sản phẩm. Chỉ trả về TÊN SẢN PHẨM hoặc DANH MỤC sản phẩm mà khách đang hỏi. KHÔNG giải thích, KHÔNG suy nghĩ, KHÔNG dùng <think>. Nếu câu hỏi là chào hỏi hoặc không liên quan tới sản phẩm, trả về "". Nếu câu hỏi dùng đại từ (nó, cái đó, loại đó...) hãy giải quyết dựa vào lịch sử hội thoại. Ví dụ: "Nó giá bao nhiêu?" + lịch sử về "iPhone 15" → "iPhone 15". Chỉ xuất ra tên sản phẩm, không có gì khác.`,
      },
    ];

    // Đưa vào tối đa 4 tin nhắn gần nhất để giải quyết đại từ
    if (history.length > 0) {
      history.slice(-4).forEach((h) => {
        extractionMessages.push({ role: h.role, content: h.content });
      });
    }
    extractionMessages.push({ role: 'user', content: userMessage });

    const model = this.configService.get<string>('OLLAMA_MODEL') || 'qwen2.5:7b';
    const response = await this.openai.chat.completions.create({
      model,
      messages: extractionMessages,
      temperature: 0,
      // Giới hạn token để extraction nhanh, tránh model "thinking" dài
      max_tokens: 100,
    });

    let keyword = this.stripThinkingTags(
      response.choices[0]?.message?.content?.trim() ?? '',
    );

    // Normalize: bỏ dấu nháy kép bao quanh nếu model trả về `"iPhone 15"`
    keyword = keyword.replace(/^["']|["']$/g, '').trim();

    return keyword || null;
  }

  /**
   * Tìm sản phẩm trong DB với nhiều chiến lược để tăng recall:
   * 1. Tìm exact phrase
   * 2. Nếu không đủ kết quả, tìm OR các từ riêng lẻ
   */
  private async retrieveProducts(keyword: string) {
    const baseQuery = { isActive: true, isDeleted: false };
    const selectFields =
      'name price short_description averageRating totalReviews stock_quantity';

    // Chiến lược 1: Tìm exact phrase (nhanh, chính xác)
    const products = await this.productModel
      .find({ ...baseQuery, name: { $regex: keyword, $options: 'i' } })
      .select(selectFields)
      .sort({ averageRating: -1 })
      .limit(10)
      .lean()
      .exec();

    // Chiến lược 2: Nếu ra ít hơn 3 kết quả, thử tìm từng từ (OR)
    if (products.length < 3) {
      const tokens = keyword
        .split(/\s+/)
        .filter((t) => t.length > 1)
        .map((t) => ({ name: { $regex: t, $options: 'i' } }));

      if (tokens.length > 1) {
        const fallback = await this.productModel
          .find({ ...baseQuery, $or: tokens })
          .select(selectFields)
          .sort({ averageRating: -1 })
          .limit(10)
          .lean()
          .exec();

        // Gộp, loại trùng theo _id
        const seen = new Set(products.map((p) => String(p._id)));
        for (const p of fallback) {
          if (!seen.has(String(p._id))) products.push(p);
          if (products.length >= 10) break;
        }
      }
    }

    return products;
  }

  // ─── Main Method ─────────────────────────────────────────────────────────────

  async generateChatStream(
    userMessage: string,
    history?: { role: 'user' | 'assistant'; content: string }[],
  ) {
    const safeHistory = history ?? [];

    try {
      // ── 1. KEYWORD EXTRACTION ──────────────────────────────────────────────
      let keyword: string | null = null;
      try {
        keyword = await this.extractSearchKeyword(userMessage, safeHistory);
      } catch (err) {
        console.warn(
          '[Chat] Keyword extraction failed, skipping retrieval:',
          err,
        );
      }

      // ── 2. RETRIEVAL ───────────────────────────────────────────────────────
      let context = 'Không có sản phẩm nào khớp.';

      if (keyword) {
        try {
          const products = await this.retrieveProducts(keyword);

          if (products.length > 0) {
            context = products
              .map((p) => {
                const desc = p.short_description
                  ? p.short_description.substring(0, 120) + '…'
                  : 'Không có mô tả.';
                const stock =
                  p.stock_quantity > 0
                    ? p.stock_quantity < 5
                      ? `⚠️ Chỉ còn ${p.stock_quantity} sp`
                      : `Còn hàng (${p.stock_quantity})`
                    : 'HẾT HÀNG';
                const rating =
                  p.averageRating > 0
                    ? `${p.averageRating.toFixed(1)}⭐ (${p.totalReviews} đánh giá)`
                    : 'Chưa có đánh giá';
                return `• ${p.name} | Giá: ${p.price.toLocaleString('vi-VN')}đ | ${rating} | ${stock}\n  → ${desc}`;
              })
              .join('\n');
          }
        } catch (dbErr) {
          console.error('[Chat] DB retrieval error:', dbErr);
          // Tiếp tục với context mặc định thay vì crash
        }
      }

      // ── 3. SYSTEM PROMPT ───────────────────────────────────────────────────
      const hasProducts = !context.startsWith('Không có sản phẩm');
      const systemPrompt = `Bạn là trợ lý bán hàng thân thiện của E-Commerce Shop. Tên bạn là "Mia".
Luôn trả lời trực tiếp bằng tiếng Việt tự nhiên. Tuyệt đối không dùng tiếng Trung hay tiếng Anh. Không chèn các câu phân tích hoặc giải thích meta vào câu trả lời.

## Dữ liệu sản phẩm (từ khoá: "${keyword ?? 'chưa xác định'}"):
${context}

## Quy tắc QUAN TRỌNG:
- Trả lời bằng TIẾNG VIỆT, NGẮN GỌN (tối đa 60 từ), tự nhiên, xưng "em", gọi khách là "anh/chị".
- KHÔNG bịa đặt sản phẩm, giá, thông tin ngoài dữ liệu trên.
- KHÔNG dùng tiếng Trung (ví dụ không dùng "呢" hay "请问"), không dùng tiếng Anh.
- KHÔNG giải thích các bước suy nghĩ hay bình luận về yêu cầu hệ thống.
- KHÔNG dùng thẻ <think> hay suy nghĩ thành văn bản.

## Xử lý theo tình huống:
${hasProducts
          ? `- Khách hỏi sản phẩm: Danh sách trên là các sản phẩm cửa hàng ĐANG CÓ. Hãy khẳng định là cửa hàng CÓ bán sản phẩm này và tư vấn trực tiếp dựa trên dữ liệu đó. Tuyệt đối KHÔNG nói cửa hàng không có sản phẩm khi sản phẩm đó đang nằm trong danh sách dữ liệu.
- Nếu còn ít hàng (⚠️): Nhắc khách mua sớm để không hết.
- Nếu HẾT HÀNG: Xin lỗi và hỏi khách có muốn xem mẫu tương tự không.`
          : `- Không tìm thấy sản phẩm khớp: Thông báo nhẹ nhàng là hiện tại chưa có sản phẩm này, hỏi khách muốn tìm sản phẩm khác không.`
        }
- Câu chào hỏi / ngoài lề: Chào lại thân thiện rồi hỏi "Dạ em có thể giúp anh/chị tìm sản phẩm gì ạ?". KHÔNG đề cập "không tìm thấy sản phẩm".`;

      // ── 4. GENERATION (Streaming) ──────────────────────────────────────────
      const apiMessages: any[] = [{ role: 'system', content: systemPrompt }];

      // Thêm tối đa 6 tin nhắn lịch sử gần nhất
      safeHistory.slice(-6).forEach((h) => {
        apiMessages.push({ role: h.role, content: h.content });
      });

      // Thêm tin nhắn hiện tại nếu chưa nằm cuối history
      const alreadyAdded =
        safeHistory.length > 0 &&
        safeHistory[safeHistory.length - 1].content === userMessage &&
        safeHistory[safeHistory.length - 1].role === 'user';
      if (!alreadyAdded) {
        apiMessages.push({ role: 'user', content: userMessage });
      }

      const model = this.configService.get<string>('OLLAMA_MODEL') || 'qwen2.5:7b';
      const stream = await this.openai.chat.completions.create({
        model,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      });

      /**
       * Generator: stream từng chunk ra ngoài.
       * Qwen2.5/DeepSeek có thể emit <think>...</think> ở đầu — ta buffer và strip trước khi yield.
       */
      async function* streamGenerator() {
        let buffer = '';
        let insideThink = false;

        for await (const chunk of stream) {
          const raw = chunk.choices[0]?.delta?.content ?? '';
          if (!raw) continue;

          buffer += raw;

          // Strip <think> blocks đang hình thành trong buffer
          // Trạng thái machine đơn giản: toggle khi gặp tag mở/đóng
          let output = '';
          let i = 0;
          while (i < buffer.length) {
            if (!insideThink && buffer.startsWith('<think>', i)) {
              insideThink = true;
              i += 7;
              continue;
            }
            if (insideThink && buffer.startsWith('</think>', i)) {
              insideThink = false;
              i += 8;
              continue;
            }
            if (!insideThink) {
              // Nếu đang ở gần cuối buffer và có thể là tag chưa hoàn chỉnh, giữ lại
              if (buffer[i] === '<' && !buffer.slice(i).includes('>')) {
                buffer = buffer.slice(i);
                i = buffer.length; // dừng, chờ chunk tiếp theo
                continue;
              }
              output += buffer[i];
            }
            i++;
          }

          // Reset buffer (phần đã xử lý hết)
          buffer = insideThink ? buffer.slice(i) : '';

          if (output) yield output;
        }

        // Flush phần còn lại của buffer (nếu có)
        if (buffer && !insideThink) yield buffer;
      }

      return streamGenerator();
    } catch (error) {
      if (
        error instanceof GatewayTimeoutException ||
        error instanceof ServiceUnavailableException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('[Chat] Unexpected error in generateChatStream:', error);
      throw new InternalServerErrorException('CHAT_SERVICE_ERROR');
    }
  }
}
