import { Product } from '@/products/schemas/product.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class User {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop()
  role: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }] })
  wishlist: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: Product.name },
        quantity: { type: Number, default: 1 },
      },
    ],
    _id: false,
  })
  cart: { product: mongoose.Schema.Types.ObjectId; quantity: number }[];

  @Prop()
  refreshToken: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  updatedBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  createdBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: Boolean, default: true })
  receiveNotifications: boolean;

  @Prop({ type: Boolean, default: true })
  sendOrderToEmail: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
