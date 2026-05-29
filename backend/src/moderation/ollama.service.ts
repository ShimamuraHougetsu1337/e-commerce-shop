import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      baseURL: this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434/v1',
      apiKey: this.configService.get<string>('OLLAMA_API_KEY') || 'ollama',
    });
  }

  async analyzeReview(comment: string): Promise<{ isAppropriate: boolean; reason: string }> {
    const prompt = `Bạn là một chuyên gia kiểm duyệt nội dung của ứng dụng E-commerce.
Hãy phân tích đoạn đánh giá (review) sau và cho biết nó có chứa nội dung tục tĩu, chửi thề, lăng mạ, phân biệt đối xử, hay spam không.

Lưu ý:
- Chỉ trả về duy nhất chuỗi JSON hợp lệ, không kèm theo markdown tag hay bất kỳ giải thích nào khác ngoài JSON.
- Cấu trúc JSON bắt buộc: { "isAppropriate": boolean, "reason": "Lý do chi tiết" }
- isAppropriate = true nếu nội dung bình thường, không vi phạm.
- isAppropriate = false nếu nội dung vi phạm.

Nội dung đánh giá cần kiểm tra: "${comment}"`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OLLAMA_MODEL') || 'qwen2.5:7b',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const responseText = response.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(responseText);
        return {
          isAppropriate: typeof parsed.isAppropriate === 'boolean' ? parsed.isAppropriate : true,
          reason: parsed.reason || '',
        };
      } catch (parseError) {
        this.logger.error('Failed to parse Ollama response as JSON', parseError);
        this.logger.debug('Raw response:', responseText);
        return { isAppropriate: true, reason: 'AI parsing error, defaulted to true' };
      }
    } catch (error) {
      this.logger.error('Error calling Ollama API via OpenAI SDK:', error.message);
      return { isAppropriate: true, reason: 'AI service unavailable' };
    }
  }
}
