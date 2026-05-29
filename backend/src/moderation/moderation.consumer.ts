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
      const result = await this.ollamaService.analyzeReview(data.comment);
      this.logger.log(`Moderation result for ${data.reviewId}: ${JSON.stringify(result)}`);

      await this.reviewsService.updateModerationStatus(
        data.reviewId,
        data.productId,
        result.isAppropriate,
        result.reason,
      );

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing review ${data.reviewId}:`, error);

      await this.reviewsService.updateModerationStatus(
        data.reviewId,
        data.productId,
        true,
        'Auto-approved (AI unavailable)',
      );

      channel.ack(originalMsg);
    }
  }
}

