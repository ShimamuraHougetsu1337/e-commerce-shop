import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    slug: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String })
    thumbnail: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    updatedBy: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    createdBy: mongoose.Schema.Types.ObjectId

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
