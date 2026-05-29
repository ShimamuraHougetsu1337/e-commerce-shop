import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { OrderStatus } from '@/orders/schemas/order.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createForUser(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    orderId?: string,
  ): Promise<Notification> {
    return this.notificationModel.create({
      userId,
      type,
      title,
      message,
      orderId: orderId || null,
    });
  }

  async getByUser(userId: string, current: number, pageSize: number) {
    const offset = (current - 1) * pageSize;

    const totalItems = await this.notificationModel.countDocuments({ userId });
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(pageSize)
      .lean();

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: notificationId, userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  buildOrderNotification(
    status: OrderStatus,
    orderId: string,
  ): { type: NotificationType; title: string; message: string } {
    const shortId = orderId.toString().slice(-6).toUpperCase();

    const map: Record<
      OrderStatus,
      { type: NotificationType; title: string; message: string }
    > = {
      [OrderStatus.PENDING]: {
        type: NotificationType.ORDER_PLACED,
        title: '🛒 Đơn hàng đã được đặt',
        message: `Đơn hàng #${shortId} của bạn đã được tạo thành công. Đang chờ xác nhận.`,
      },
      [OrderStatus.AWAITING_CONFIRMATION]: {
        type: NotificationType.ORDER_PLACED,
        title: '⏳ Đang chờ xác nhận',
        message: `Đơn hàng #${shortId} đang chờ người bán xác nhận.`,
      },
      [OrderStatus.CONFIRMED]: {
        type: NotificationType.ORDER_CONFIRMED,
        title: '✅ Đơn hàng đã được xác nhận',
        message: `Đơn hàng #${shortId} đã được xác nhận và sắp được chuẩn bị.`,
      },
      [OrderStatus.PREPARING]: {
        type: NotificationType.ORDER_PREPARING,
        title: '📦 Đang chuẩn bị hàng',
        message: `Đơn hàng #${shortId} đang được đóng gói và chuẩn bị giao hàng.`,
      },
      [OrderStatus.SHIPPING]: {
        type: NotificationType.ORDER_SHIPPING,
        title: '🚚 Đơn hàng đang được giao',
        message: `Đơn hàng #${shortId} đang trên đường đến tay bạn. Hãy chú ý điện thoại!`,
      },
      [OrderStatus.DELIVERED]: {
        type: NotificationType.ORDER_DELIVERED,
        title: '📬 Đơn hàng đã được giao',
        message: `Đơn hàng #${shortId} đã giao thành công. Hãy xác nhận và đánh giá sản phẩm nhé!`,
      },
      [OrderStatus.COMPLETED]: {
        type: NotificationType.ORDER_COMPLETED,
        title: '🎉 Đơn hàng hoàn thành',
        message: `Đơn hàng #${shortId} đã hoàn thành. Cảm ơn bạn đã mua sắm!`,
      },
      [OrderStatus.CANCELLED]: {
        type: NotificationType.ORDER_CANCELLED,
        title: '❌ Đơn hàng đã bị hủy',
        message: `Đơn hàng #${shortId} đã bị hủy. Liên hệ hỗ trợ nếu bạn cần trợ giúp.`,
      },
      [OrderStatus.RETURNED]: {
        type: NotificationType.ORDER_RETURNED,
        title: '↩️ Đơn hàng đã hoàn trả',
        message: `Yêu cầu hoàn trả đơn hàng #${shortId} đang được xử lý.`,
      },
    };

    return (
      map[status] ?? {
        type: NotificationType.ORDER_PLACED,
        title: 'Cập nhật đơn hàng',
        message: `Đơn hàng #${shortId} vừa được cập nhật trạng thái: ${status}.`,
      }
    );
  }
}
