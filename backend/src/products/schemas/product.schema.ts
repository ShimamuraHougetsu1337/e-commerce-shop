import { Category } from '@/categories/schemas/category.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Product {

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, unique: true, type: String })
    slug: string;

    @Prop({ type: String })
    long_description: string;

    @Prop({ type: String })
    short_description: string;

    @Prop({ required: true, type: Number, min: 0 })
    price: number;

    @Prop({ required: true, type: Number, min: 0, default: 0 })
    stock_quantity: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
    category: mongoose.Schema.Types.ObjectId;

    @Prop({ type: [String] })
    images: string[];

    @Prop({ type: [Number], index: false }) // Lưu mảng số đại diện cho Vector
    image_vector: number[];

    @Prop({ type: Number, default: 0 })
    averageRating: number;

    @Prop({ type: Number, default: 0 })
    totalReviews: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    updatedBy: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    createdBy: mongoose.Schema.Types.ObjectId

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;

    @Prop({ default: true })
    isActive: boolean
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', short_description: 'text', long_description: 'text' });
