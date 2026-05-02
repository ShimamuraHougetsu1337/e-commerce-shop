
import { Product } from '@/products/schemas/product.schema';
import { User } from '@/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
    productId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ required: true })
    comment: string;

    @Prop({ type: [String] })
    images: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Compound unique index: Each user can only review a product once
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
