import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from './schemas/chat-message.schema';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Quản lý số lượng kết nối của User
  private userConnections = new Map<string, number>();
  // Ánh xạ socketId tới userId
  private socketToUser = new Map<string, string>();
  // Set lưu trữ các socketId của Admin đang online
  private adminSocketIds = new Set<string>();

  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      this.socketToUser.delete(client.id);
      const currentCount = this.userConnections.get(userId) || 0;
      if (currentCount <= 1) {
        this.userConnections.delete(userId);
        this.server.emit('user_status_change', { userId, status: 'offline' });
      } else {
        this.userConnections.set(userId, currentCount - 1);
      }
    }

    // Nếu socket ngắt kết nối là của Admin
    if (this.adminSocketIds.has(client.id)) {
      this.adminSocketIds.delete(client.id);
      if (this.adminSocketIds.size === 0) {
        // Chỉ phát offline khi KHÔNG CÒN socket admin nào kết nối
        this.server.emit('admin_status_change', { status: 'offline' });
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userId?: string; isAdmin?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);

    if (data.userId) {
      this.socketToUser.set(client.id, data.userId);
      const currentCount = this.userConnections.get(data.userId) || 0;
      if (currentCount === 0) {
        this.server.emit('user_status_change', {
          userId: data.userId,
          status: 'online',
        });
      }
      this.userConnections.set(data.userId, currentCount + 1);
    }

    if (data.isAdmin) {
      this.adminSocketIds.add(client.id);
      // Phát sóng toàn cục cho tất cả User biết Admin đã Online
      this.server.emit('admin_status_change', { status: 'online' });
    }

    if (data.roomId === 'admins') {
      const onlineIds = Array.from(this.userConnections.keys());
      client.emit('online_users_list', onlineIds);
    }

    // Luôn gửi trạng thái admin hiện tại cho người vừa join
    client.emit('admin_status_change', {
      status: this.adminSocketIds.size > 0 ? 'online' : 'offline',
    });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      content: string;
      roomId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const newMessage = await this.chatMessageModel.create({
      senderId: data.senderId,
      receiverId: data.receiverId === 'ADMIN' ? null : data.receiverId,
      content: data.content,
    });

    let target = this.server.to(data.roomId);
    if (data.receiverId === 'ADMIN') {
      target = target.to('admins');
    }
    target.emit('new_message', newMessage);
  }
}
