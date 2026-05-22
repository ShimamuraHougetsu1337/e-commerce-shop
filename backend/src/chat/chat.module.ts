import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema }
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule { }
