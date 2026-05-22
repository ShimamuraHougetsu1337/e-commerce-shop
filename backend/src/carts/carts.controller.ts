import { ResponseMessage, User, type IUser } from '@/decorator/customize';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ResponseMessage('Lấy thông tin giỏ hàng thành công')
  getCart(@User() user: IUser) {
    return this.cartsService.getCart(user);
  }

  @Post('add')
  @ResponseMessage('Đã thêm sản phẩm vào giỏ hàng')
  addToCart(@User() user: IUser, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(user, addToCartDto);
  }

  @Patch('update')
  @ResponseMessage('Cập nhật số lượng thành công')
  updateQuantity(@User() user: IUser, @Body() updateDto: AddToCartDto) {
    return this.cartsService.updateQuantity(user, updateDto);
  }

  @Delete('remove/:productId')
  @ResponseMessage('Đã xóa sản phẩm khỏi giỏ hàng')
  removeFromCart(@User() user: IUser, @Param('productId') productId: string) {
    return this.cartsService.removeFromCart(user, productId);
  }

  @Delete('clear')
  @ResponseMessage('Đã làm trống giỏ hàng')
  clearCart(@User() user: IUser) {
    return this.cartsService.clearCart(user);
  }
}
