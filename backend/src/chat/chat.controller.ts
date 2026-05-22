import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Public } from '../decorator/customize';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Get('health')
  async checkHealth() {
    const isOk = await this.chatService.checkHealth();
    if (isOk) {
      return { status: 'ok' };
    } else {
      return { status: 'error', message: 'AI service offline' };
    }
  }

  @Public()
  @Post('stream')
  @Sse()
  async streamChat(
    @Body('message') message: string,
    @Body('history')
    history?: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<Observable<MessageEvent>> {
    const stream = await this.chatService.generateChatStream(message, history);

    return new Observable((subscriber) => {
      (async () => {
        try {
          for await (const chunkText of stream) {
            if (chunkText) {
              subscriber.next({ text: chunkText } as any);
            }
          }
          subscriber.complete();
        } catch (error: any) {
          console.error('Stream Iteration Error:', error);
          let errorCode = 'AI_GENERIC_ERROR';
          if (
            error?.status === 429 ||
            error?.message?.includes('429') ||
            error?.message?.includes('quota')
          ) {
            errorCode = 'AI_QUOTA_EXCEEDED';
          }
          subscriber.next({ text: `[ERROR_CODE:${errorCode}]` } as any);
          subscriber.complete();
        }
      })();
    });
  }

  @Get('history/:userId')
  async getChatHistory(@Param('userId') userId: string) {
    return await this.chatService.getChatHistory(userId);
  }

  @Get('active-chats')
  async getActiveChats() {
    return await this.chatService.getActiveChats();
  }
}
