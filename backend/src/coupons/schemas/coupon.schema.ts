import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: ['PERCENTAGE', 'FIXED'] })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: true })
  minOrderValue: number;

  @Prop({ required: true })
  maxUsage: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  usedBy: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  assignedTo?: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
