import { type IUser, ResponseMessage, User } from '@/decorator/customize';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+current, +pageSize, qs);
  }

  @Get('wishlist')
  @ResponseMessage('Get user wishlist')
  getWishlist(@User() user: IUser) {
    return this.usersService.getWishlist(user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('wishlist')
  @ResponseMessage('Add product to wishlist')
  addToWishlist(@User() user: IUser, @Body('productId') productId: string) {
    return this.usersService.addToWishlist(user._id, productId);
  }

  @Delete('wishlist/:productId')
  @ResponseMessage('Remove product from wishlist')
  removeFromWishlist(
    @User() user: IUser,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(user._id, productId);
  }

  @Patch('profile')
  @ResponseMessage('Update user profile')
  updateProfile(
    @User() user: IUser,
    @Body()
    data: {
      name?: string;
      oldPassword?: string;
      newPassword?: string;
      phone?: string;
      address?: string;
      avatar?: string;
      receiveNotifications?: boolean;
      sendOrderToEmail?: boolean;
    },
  ) {
    return this.usersService.updateProfile(user._id, data);
  }
}
