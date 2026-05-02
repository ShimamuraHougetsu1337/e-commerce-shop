import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Public } from '../decorator/customize';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Public()
  @Post('stream')
  @Sse()
  async streamChat(@Body('message') message: string): Promise<Observable<MessageEvent>> {
    const stream = await this.chatService.generateChatStream(message);

    return new Observable((subscriber) => {
      (async () => {
        try {
          for await (const chunk of stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              subscriber.next({ text: chunkText } as any);
            }
          }
          subscriber.complete();
        } catch (error: any) {
          console.error("Stream Iteration Error:", error);
          let errorCode = 'AI_GENERIC_ERROR';
          if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
            errorCode = 'AI_QUOTA_EXCEEDED';
          }
          subscriber.next({ text: `[ERROR_CODE:${errorCode}]` } as any);
          subscriber.complete();
        }
      })();
    });
  }
}
