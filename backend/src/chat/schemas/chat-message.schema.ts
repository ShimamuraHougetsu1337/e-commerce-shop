import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiverId: mongoose.Schema.Types.ObjectId; // Nếu null, tin nhắn hướng tới Admin/Hệ thống

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
