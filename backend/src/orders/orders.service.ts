import { Coupon, CouponDocument } from '@/coupons/schemas/coupon.schema';
import { IUser } from '@/decorator/customize';
import { MailService } from '@/mail/mail.service';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { CreateOrderDto } from './dto/order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        private mailService: MailService
    ) { }

    async createOrder(user: IUser, createOrderDto: CreateOrderDto): Promise<Order> {
        // 1. Kiểm tra tồn kho của tất cả sản phẩm trong đơn hàng
        for (const item of createOrderDto.items) {
            const product = await this.productModel.findById(item.product);
            if (!product) {
                throw new NotFoundException(`Sản phẩm ${item.productName} không tồn tại`);
            }
            if (product.stock_quantity < item.quantity) {
                throw new BadRequestException(`Sản phẩm ${item.productName} không đủ số lượng trong kho (Còn lại: ${product.stock_quantity})`);
            }
        }

        // 2. Tạo đơn hàng
        const order = await this.orderModel.create({
            userId: user._id,
            ...createOrderDto,
        });

        // 3. Cập nhật số lượng tồn kho và xử lý coupon
        if (order) {
            // Cập nhật tồn kho cho từng sản phẩm
            for (const item of createOrderDto.items) {
                await this.productModel.updateOne(
                    { _id: item.product },
                    { $inc: { stock_quantity: -item.quantity } }
                );
            }

            // Xử lý Coupon nếu có
            if (createOrderDto.couponCode) {
                await this.couponModel.updateOne(
                    { code: createOrderDto.couponCode.toUpperCase() },
                    { 
                        $inc: { usedCount: 1 },
                        $push: { usedBy: user._id }
                    }
                );
            }
        }

        // 4. Gửi email xác nhận (không làm gián đoạn luồng chính)
        if (order) {
            const fullUser = await this.userModel.findById(user._id);
            this.mailService.sendOrderConfirmation(order, fullUser || user);
        }

        return order;
    }

    async getOrdersByUser(userId: string): Promise<Order[]> {
        return this.orderModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images')
            .lean();
    }

    async getOrderById(orderId: string, userId: string): Promise<Order> {
        const order = await this.orderModel
            .findOne({ _id: orderId, userId })
            .populate('items.product', 'name images')
            .lean();
        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }
        return order;
    }

    async findAll(current: number, pageSize: number, qs: string) {
        let { filter, sort, projection, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        // Xử lý tìm kiếm thông minh từ query parameter
        if (filter.query) {
            const queryStr = filter.query.toString();
            delete filter.query;

            if (mongoose.isValidObjectId(queryStr)) {
                // Nếu là ID hợp lệ, tìm theo Order ID chính xác
                filter._id = queryStr;
            } else {
                // Tìm kiếm người dùng có tên hoặc email khớp với từ khóa
                const users = await this.userModel.find({
                    $or: [
                        { name: { $regex: queryStr, $options: 'i' } },
                        { email: { $regex: queryStr, $options: 'i' } }
                    ]
                }).select('_id');
                
                const userIds = users.map(u => u._id);
                
                // Kết hợp tìm kiếm: theo danh sách userIds HOẶC theo địa chỉ, phương thức thanh toán HOẶC phần nào đó của ID
                filter.$or = [
                    { userId: { $in: userIds } },
                    { shippingAddress: { $regex: queryStr, $options: 'i' } },
                    { paymentMethod: { $regex: queryStr, $options: 'i' } },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $toString: "$_id" },
                                regex: queryStr,
                                options: "i"
                            }
                        }
                    }
                ];
            }
        }

        let offset = (+current - 1) * (+pageSize);
        let defaultLimit = +pageSize ? +pageSize : 10;

        const totalItems = (await this.orderModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.orderModel.find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any)
            .populate(population)
            .populate('userId', 'name email phone')
            .exec();

        return {
            meta: {
                current: current,
                pageSize: pageSize,
                pages: totalPages,
                total: totalItems
            },
            result
        }
    }

    async updateStatus(id: string, status: string) {
        return await this.orderModel.updateOne(
            { _id: id },
            { status }
        );
    }
}
