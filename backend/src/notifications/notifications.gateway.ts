import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map userId -> Set of socketIds (một user có thể mở nhiều tab)
  private userSockets = new Map<string, Set<string>>();
  // Map socketId -> userId
  private socketToUser = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`[Notifications] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      this.socketToUser.delete(client.id);
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    console.log(`[Notifications] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('notification:join')
  handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    this.socketToUser.set(client.id, userId);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);

    client.join(`user:${userId}`);
    console.log(`[Notifications] User ${userId} joined notification room`);
  }

  /**
   * Gửi thông báo đến một user cụ thể theo userId
   */
  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /**
   * Gửi thông báo đến tất cả admin (room 'admins')
   */
  sendToAdmins(notification: any) {
    this.server.to('admins').emit('notification:admin', notification);
  }

  @SubscribeMessage('notification:admin_join')
  handleAdminJoin(@ConnectedSocket() client: Socket) {
    client.join('admins');
    console.log(`[Notifications] Admin socket ${client.id} joined admins room`);
  }
}
