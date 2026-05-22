import {
  Public,
  ResponseMessage,
  User,
  type IUser,
} from '@/decorator/customize';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { OrdersService } from './orders.service';
import * as express from 'express';

import { OrderStatus } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ResponseMessage('Tạo đơn hàng thành công')
  createOrder(
    @User() user: IUser,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: express.Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    return this.ordersService.createOrder(user, createOrderDto, ipAddress);
  }

  @Get('vnpay-ipn')
  @Public()
  @ResponseMessage('Xử lý IPN từ VNPAY')
  vnpayIpn(@Query() query: any) {
    return this.ordersService.handleVnpayIpn(query);
  }

  @Get('vnpay-verify')
  @Public()
  @ResponseMessage('Xác thực thanh toán VNPAY')
  vnpayVerify(@Query() query: any) {
    return this.ordersService.verifyVnpayPayment(query);
  }

  @Get('my-orders')
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  getMyOrders(@User() user: IUser) {
    return this.ordersService.getOrdersByUser(user._id);
  }

  @Get(':orderId')
  @ResponseMessage('Lấy thông tin đơn hàng thành công')
  getOrderById(@User() user: IUser, @Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(orderId, user._id);
  }

  @Get()
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,
  ) {
    return this.ordersService.findAll(+current, +pageSize, qs);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật trạng thái đơn hàng thành công')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('note') note: string,
    @User() user: IUser,
  ) {
    return this.ordersService.updateOrderStatus(id, status, user, note);
  }
}
