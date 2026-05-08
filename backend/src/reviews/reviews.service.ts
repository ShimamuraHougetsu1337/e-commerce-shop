
import { IUser } from '@/decorator/customize';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>
    ) { }

    async create(user: IUser, createReviewDto: CreateReviewDto) {
        const { productId } = createReviewDto;

        const existingReview = await this.reviewModel.findOne({ userId: user._id, productId });
        if (existingReview) {
            throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
        }

        const newReview = await this.reviewModel.create({
            ...createReviewDto,
            userId: user._id
        });

        // Sync product stats
        await this.updateProductStats(productId);

        return newReview;
    }

    async findByUser(user: IUser) {
        return await this.reviewModel.find({ userId: user._id })
            .populate('productId', 'name images')
            .sort({ createdAt: -1 });
    }

    async findByProduct(productId: string, current: number, pageSize: number) {
        const offset = (current - 1) * pageSize;
        const filter = { productId, isHidden: { $ne: true } };
        const totalItems = await this.reviewModel.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / pageSize);

        const result = await this.reviewModel.find(filter)
            .populate('userId', 'name email avatar')
            .skip(offset)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        return {
            meta: {
                current,
                pageSize,
                pages: totalPages,
                total: totalItems
            },
            result
        };
    }

    async update(id: string, user: IUser, updateReviewDto: Partial<CreateReviewDto>) {
        const review = await this.reviewModel.findOne({ _id: id, userId: user._id });
        if (!review) {
            throw new BadRequestException('Không tìm thấy đánh giá hoặc bạn không có quyền sửa');
        }

        const updatedReview = await this.reviewModel.findByIdAndUpdate(
            id,
            { ...updateReviewDto },
            { new: true }
        );

        // Sync product stats
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
            filter.$or = [
                { comment: { $regex: query, $options: 'i' } },
            ];
        }

        const totalItems = await this.reviewModel.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / pageSize);

        const result = await this.reviewModel.find(filter)
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
                total: totalItems
            },
            result
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
            { new: true }
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
            { new: true }
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
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$productId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
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
