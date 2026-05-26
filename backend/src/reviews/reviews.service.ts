import { IUser } from '@/decorator/customize';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject('MODERATION_SERVICE') private readonly moderationClient: ClientProxy,
  ) {}

  async create(user: IUser, createReviewDto: CreateReviewDto) {
    const { productId } = createReviewDto;

    const newReview = await this.reviewModel.create({
      ...createReviewDto,
      userId: user._id,
      status: 'PENDING_MODERATION',
      isHidden: true,
    });

    // Publish to RabbitMQ
    this.moderationClient.emit('review.moderate', {
      reviewId: newReview._id,
      comment: newReview.comment,
      productId: newReview.productId,
    });

    // Do not sync product stats here because it is hidden/pending.
    // It will be synced when the AI approves it.

    return newReview;
  }

  async updateModerationStatus(
    reviewId: string,
    productId: string,
    isAppropriate: boolean,
    reason: string,
  ) {
    const status = isAppropriate ? 'APPROVED' : 'REJECTED';
    const isHidden = !isAppropriate;

    await this.reviewModel.findByIdAndUpdate(reviewId, {
      status,
      isHidden,
      moderationReason: reason,
    });

    if (isAppropriate) {
      // Sync stats only if approved
      await this.updateProductStats(productId);
    }
  }

  async findByUser(user: IUser) {
    return await this.reviewModel
      .find({ userId: user._id })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });
  }

  async findByProduct(productId: string, current: number, pageSize: number) {
    const offset = (current - 1) * pageSize;
    const filter = { productId, isHidden: { $ne: true } };
    const totalItems = await this.reviewModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.reviewModel
      .find(filter)
      .populate('userId', 'name email avatar')
      .skip(offset)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async update(
    id: string,
    user: IUser,
    updateReviewDto: Partial<CreateReviewDto>,
  ) {
    const review = await this.reviewModel.findOne({
      _id: id,
      userId: user._id,
    });
    if (!review) {
      throw new BadRequestException(
        'Không tìm thấy đánh giá hoặc bạn không có quyền sửa',
      );
    }

    review.set({
      ...updateReviewDto,
      status: 'PENDING_MODERATION',
      isHidden: true,
      moderationReason: null
    });
    const updatedReview = await review.save();

    // Re-publish to RabbitMQ for re-moderation
    this.moderationClient.emit('review.moderate', {
      reviewId: updatedReview._id,
      comment: updatedReview.comment,
      productId: updatedReview.productId,
    });

    // Sync product stats (will be removed from stats until approved)
    await this.updateProductStats(review.productId.toString());

    return updatedReview;
  }

  async delete(id: string, user: IUser) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new BadRequestException('Không tìm thấy đánh giá');
    }

    // Only allow owner or admin to delete
    if (review.userId.toString() !== user._id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    const productId = review.productId.toString();
    await this.reviewModel.findByIdAndDelete(id);

    // Sync product stats
    await this.updateProductStats(productId);

    return { deleted: true };
  }

  // === ADMIN METHODS ===

  async findAllAdmin(current: number, pageSize: number, query?: string) {
    const offset = (current - 1) * pageSize;
    const filter: any = {};

    if (query) {
      filter.$or = [{ comment: { $regex: query, $options: 'i' } }];
    }

    const totalItems = await this.reviewModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.reviewModel
      .find(filter)
      .populate('userId', 'name email avatar')
      .populate('productId', 'name images slug')
      .skip(offset)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async adminReply(id: string, reply: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new BadRequestException('Không tìm thấy đánh giá');
    }

    return await this.reviewModel.findByIdAndUpdate(
      id,
      { adminReply: reply, adminReplyAt: new Date() },
      { new: true },
    );
  }

  async toggleHidden(id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new BadRequestException('Không tìm thấy đánh giá');
    }

    return await this.reviewModel.findByIdAndUpdate(
      id,
      { isHidden: !review.isHidden },
      { new: true },
    );
  }

  async adminDelete(id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new BadRequestException('Không tìm thấy đánh giá');
    }

    const productId = review.productId.toString();
    await this.reviewModel.findByIdAndDelete(id);

    await this.updateProductStats(productId);

    return { deleted: true };
  }

  /**
   * Recalculates averageRating and totalReviews for a product using MongoDB Aggregation
   */
  private async updateProductStats(productId: string) {
    const stats = await this.reviewModel.aggregate([
      { 
        $match: { 
          productId: new mongoose.Types.ObjectId(productId),
          isHidden: false,
          status: 'APPROVED'
        } 
      },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const { averageRating, totalReviews } = stats[0];
      const roundedRating = Math.round(averageRating * 10) / 10;
      await this.productModel.findByIdAndUpdate(productId, {
        averageRating: roundedRating,
        totalReviews,
      });
    } else {
      // Reset to 0 if no reviews left
      await this.productModel.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  }
}
