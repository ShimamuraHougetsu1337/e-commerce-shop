import {
  Public,
  ResponseMessage,
  User,
  type IUser,
} from '@/decorator/customize';
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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ResponseMessage('Tạo mã giảm giá thành công')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ResponseMessage('Lấy danh sách mã giảm giá thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.couponsService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get('active')
  @ResponseMessage('Lấy danh sách mã giảm giá khả dụng thành công')
  findActive(@Query('userId') userId?: string) {
    return this.couponsService.findActive(userId);
  }

  @Post('apply')
  @ResponseMessage('Áp dụng mã giảm giá thành công')
  applyCoupon(
    @Body() body: { code: string; orderValue: number },
    @User() user: IUser,
  ) {
    return this.couponsService.applyCoupon(
      body.code,
      body.orderValue,
      user._id,
    );
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin mã giảm giá thành công')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật mã giảm giá thành công')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa mã giảm giá thành công')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
