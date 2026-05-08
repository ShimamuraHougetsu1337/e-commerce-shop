
import { Public, ResponseMessage, User, type IUser } from '@/decorator/customize';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @ResponseMessage('Tạo đánh giá thành công')
    create(@User() user: IUser, @Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(user, createReviewDto);
    }

    @Get('user')
    @ResponseMessage('Lấy danh sách đánh giá của người dùng thành công')
    findByUser(@User() user: IUser) {
        return this.reviewsService.findByUser(user);
    }

    @Public()
    @Get('product/:productId')
    @ResponseMessage('Lấy danh sách đánh giá của sản phẩm thành công')
    findByProduct(
        @Param('productId') productId: string,
        @Query('current') current: string,
        @Query('pageSize') pageSize: string
    ) {
        return this.reviewsService.findByProduct(productId, +current || 1, +pageSize || 10);
    }

    @Patch(':id')
    @ResponseMessage('Cập nhật đánh giá thành công')
    update(
        @Param('id') id: string,
        @User() user: IUser,
        @Body() updateReviewDto: Partial<CreateReviewDto>
    ) {
        return this.reviewsService.update(id, user, updateReviewDto);
    }

    @Delete(':id')
    @ResponseMessage('Xóa đánh giá thành công')
    delete(@Param('id') id: string, @User() user: IUser) {
        return this.reviewsService.delete(id, user);
    }

    // === ADMIN ENDPOINTS ===

    @Get('admin/all')
    @ResponseMessage('Lấy danh sách đánh giá thành công (Admin)')
    findAllAdmin(
        @Query('current') current: string,
        @Query('pageSize') pageSize: string,
        @Query('query') query: string
    ) {
        return this.reviewsService.findAllAdmin(+current || 1, +pageSize || 10, query);
    }

    @Patch('admin/:id/reply')
    @ResponseMessage('Phản hồi đánh giá thành công')
    adminReply(@Param('id') id: string, @Body('reply') reply: string) {
        return this.reviewsService.adminReply(id, reply);
    }

    @Patch('admin/:id/toggle-hidden')
    @ResponseMessage('Cập nhật trạng thái ẩn/hiện đánh giá thành công')
    toggleHidden(@Param('id') id: string) {
        return this.reviewsService.toggleHidden(id);
    }

    @Delete('admin/:id')
    @ResponseMessage('Xóa đánh giá thành công (Admin)')
    adminDelete(@Param('id') id: string) {
        return this.reviewsService.adminDelete(id);
    }
}
