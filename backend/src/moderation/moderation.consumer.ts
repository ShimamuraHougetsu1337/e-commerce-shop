import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { OllamaService } from './ollama.service';
import { ReviewsService } from '../reviews/reviews.service';

@Controller()
export class ModerationConsumer {
  private readonly logger = new Logger(ModerationConsumer.name);

  constructor(
    private readonly ollamaService: OllamaService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @EventPattern('review.moderate')
  async handleReviewModeration(
    @Payload() data: { reviewId: string; comment: string; productId: string },
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`Received review moderation task for review: ${data.reviewId}`);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Gọi AI kiểm duyệt
      const result = await this.ollamaService.analyzeReview(data.comment);
      this.logger.log(`Moderation result for ${data.reviewId}: ${JSON.stringify(result)}`);

      // Cập nhật Database
      await this.reviewsService.updateModerationStatus(
        data.reviewId,
        data.productId,
        result.isAppropriate,
        result.reason,
      );

      // Acknowledge message sau khi thành công
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing review ${data.reviewId}:`, error);
      // Nack và đưa lại vào queue (nếu muốn retry) hoặc bỏ qua
      // channel.nack(originalMsg, false, false);
      // Giữ nguyên pending trong DB.
      channel.nack(originalMsg, false, true); // requeue
    }
  }
}
