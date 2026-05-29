import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ResponseMessage, User, type IUser } from '@/decorator/customize';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ResponseMessage('Lấy danh sách thông báo thành công')
  getMyNotifications(
    @User() user: IUser,
    @Query('current') current?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notificationsService.getByUser(
      user._id,
      current ? +current : 1,
      pageSize ? +pageSize : 50,
    );
  }

  @Get('unread-count')
  @ResponseMessage('Lấy số thông báo chưa đọc thành công')
  async getUnreadCount(@User() user: IUser) {
    const count = await this.notificationsService.getUnreadCount(user._id);
    return { count };
  }

  @Patch(':id/read')
  @ResponseMessage('Đánh dấu đã đọc thành công')
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.markAsRead(id, user._id);
  }

  @Patch('read-all')
  @ResponseMessage('Đánh dấu tất cả đã đọc thành công')
  markAllAsRead(@User() user: IUser) {
    return this.notificationsService.markAllAsRead(user._id);
  }
}
