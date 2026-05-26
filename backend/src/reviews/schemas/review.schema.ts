import { Product } from '@/products/schemas/product.schema';
import { User } from '@/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Review {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  productId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: String, default: null })
  adminReply: string;

  @Prop({ type: Date, default: null })
  adminReplyAt: Date;

  @Prop({ type: Boolean, default: false })
  isHidden: boolean;

  @Prop({
    type: String,
    enum: ['PENDING_MODERATION', 'APPROVED', 'REJECTED'],
    default: 'PENDING_MODERATION',
  })
  status: string;

  @Prop({ type: String, default: null })
  moderationReason: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
