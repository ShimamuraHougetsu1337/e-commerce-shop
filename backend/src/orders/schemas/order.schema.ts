import { Product } from '@/products/schemas/product.schema';
import { User } from '@/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'Pending',
  AWAITING_CONFIRMATION = 'Awaiting Confirmation',
  CONFIRMED = 'Confirmed',
  PREPARING = 'Preparing',
  SHIPPING = 'Shipping',
  DELIVERED = 'Delivered',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
}

@Schema({ _id: false })
class OrderTimeline {
  @Prop({ type: String, enum: OrderStatus, required: true })
  status: OrderStatus;

  @Prop({ type: String })
  note: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  actionBy: mongoose.Schema.Types.ObjectId;
}

@Schema({ _id: false })
class OrderItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  productName: string;

  @Prop({ required: true, type: Number, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;
}

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Order {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, type: Number, min: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, default: '' })
  shippingAddress: string;

  @Prop({ type: String, default: 'COD' })
  paymentMethod: string;

  @Prop({ type: String })
  couponCode?: string;

  @Prop({ type: Number })
  discountValue?: number;

  @Prop({ type: String })
  discountType?: string;

  @Prop({ type: Number })
  minOrderValue?: number;

  @Prop({ type: [OrderTimeline], default: [] })
  timeline: OrderTimeline[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
