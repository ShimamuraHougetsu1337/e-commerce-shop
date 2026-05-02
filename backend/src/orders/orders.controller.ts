
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { ResponseMessage, User, type IUser } from '@/decorator/customize';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ResponseMessage('Tạo đơn hàng thành công')
    createOrder(
        @User() user: IUser,
        @Body() createOrderDto: CreateOrderDto
    ) {
        return this.ordersService.createOrder(user, createOrderDto);
    }

    @Get('my-orders')
    @ResponseMessage('Lấy danh sách đơn hàng thành công')
    getMyOrders(@User() user: IUser) {
        return this.ordersService.getOrdersByUser(user._id);
    }

    @Get(':orderId')
    @ResponseMessage('Lấy thông tin đơn hàng thành công')
    getOrderById(
        @User() user: IUser,
        @Param('orderId') orderId: string
    ) {
        return this.ordersService.getOrderById(orderId, user._id);
    }

    @Get()
    @ResponseMessage('Lấy danh sách đơn hàng thành công')
    findAll(
        @Query('current') current: string,
        @Query('pageSize') pageSize: string,
        @Query() qs: string
    ) {
        return this.ordersService.findAll(+current, +pageSize, qs);
    }

    @Patch(':id')
    @ResponseMessage('Cập nhật trạng thái đơn hàng thành công')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: string
    ) {
        return this.ordersService.updateStatus(id, status);
    }
}
