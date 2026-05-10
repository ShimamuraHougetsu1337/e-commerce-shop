import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SpinHistoryDocument = HydratedDocument<SpinHistory>;

@Schema({ timestamps: true })
export class SpinHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  spinDate: string;

  @Prop({ type: Object, required: true })
  reward: {
    type: 'COUPON' | 'NONE';
    value: string;
    label: string;
  };
}

export const SpinHistorySchema = SchemaFactory.createForClass(SpinHistory);
