import { Coupon, CouponDocument } from '@/coupons/schemas/coupon.schema';
import { IUser } from '@/decorator/customize';
import { MailService } from '@/mail/mail.service';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Connection, Model } from 'mongoose';
import { CreateOrderDto } from './dto/order.dto';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectConnection() private readonly connection: Connection,
        private mailService: MailService
    ) { }

    async createOrder(user: IUser, createOrderDto: CreateOrderDto): Promise<Order> {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // 1. Kiểm tra tồn kho của tất cả sản phẩm trong đơn hàng (Fail fast)
            for (const item of createOrderDto.items) {
                const product = await this.productModel.findById(item.product).session(session);
                if (!product) {
                    throw new NotFoundException(`Sản phẩm ${item.productName} không tồn tại`);
                }
                if (product.stock_quantity < item.quantity) {
                    throw new BadRequestException(`Sản phẩm ${item.productName} không đủ số lượng trong kho (Còn lại: ${product.stock_quantity})`);
                }
            }

            // 2. Tạo đơn hàng
            const orderArray = await this.orderModel.create([{
                userId: user._id,
                ...createOrderDto,
                status: OrderStatus.PENDING,
                timeline: [{
                    status: OrderStatus.PENDING,
                    note: 'Đơn hàng đã được khởi tạo thành công',
                    timestamp: new Date(),
                    actionBy: user._id
                }]
            }], { session });
            const order = orderArray[0];

            // 3. Cập nhật số lượng tồn kho (Sử dụng Atomic Update với check điều kiện)
            for (const item of createOrderDto.items) {
                const updateResult = await this.productModel.updateOne(
                    { 
                        _id: item.product, 
                        stock_quantity: { $gte: item.quantity } // Điều kiện quan trọng để tránh Race Condition
                    },
                    { $inc: { stock_quantity: -item.quantity } },
                    { session }
                );

                if (updateResult.modifiedCount === 0) {
                    throw new BadRequestException(`Sản phẩm ${item.productName} vừa mới hết hàng hoặc không đủ số lượng. Vui lòng kiểm tra lại!`);
                }
            }

            // 4. Xử lý Coupon nếu có
            if (createOrderDto.couponCode) {
                const coupon = await this.couponModel.findOne({ 
                    code: createOrderDto.couponCode.toUpperCase(),
                    isActive: true,
                    expiryDate: { $gte: new Date() }
                }).session(session);

                if (!coupon) {
                    throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã hết hạn');
                }

                if (coupon.usedCount >= coupon.maxUsage) {
                    throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
                }

                if (coupon.code.startsWith('SPIN-') && !coupon.assignedTo) {
                    throw new BadRequestException('Mã giảm giá này đã cũ và không còn hợp lệ');
                }

                if (coupon.assignedTo && coupon.assignedTo.toString() !== user._id.toString()) {
                    throw new BadRequestException('Mã giảm giá này không dành cho tài khoản của bạn');
                }

                await this.couponModel.updateOne(
                    { _id: coupon._id, usedCount: { $lt: coupon.maxUsage } },
                    { 
                        $inc: { usedCount: 1 },
                        $push: { usedBy: user._id }
                    },
                    { session }
                );
            }

            // Commit transaction
            await session.commitTransaction();

            // 5. Gửi email xác nhận (không làm gián đoạn luồng chính, chạy sau khi commit)
            const fullUser = await this.userModel.findById(user._id);
            this.mailService.sendOrderConfirmation(order, fullUser || user);

            return order;

        } catch (error) {
            // Abort transaction if any error occurs
            await session.abortTransaction();
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Có lỗi xảy ra trong quá trình xử lý đơn hàng: ' + error.message);
        } finally {
            session.endSession();
        }
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

    async updateOrderStatus(id: string, status: OrderStatus, user: IUser, note?: string) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }

        // Logic kiểm tra chuyển đổi trạng thái (Optional nhưng chuyên sâu)
        // Ví dụ: Không cho phép chuyển từ Cancelled sang status khác
        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Không thể cập nhật trạng thái cho đơn hàng đã bị hủy');
        }

        if (order.status === OrderStatus.COMPLETED) {
            throw new BadRequestException('Đơn hàng đã hoàn thành, không thể thay đổi trạng thái');
        }

        const timelineEntry = {
            status,
            note: note || `Cập nhật trạng thái: ${status}`,
            timestamp: new Date(),
            actionBy: user._id
        };

        const result = await this.orderModel.findByIdAndUpdate(
            id,
            { 
                status,
                $push: { timeline: timelineEntry }
            },
            { new: true }
        ).populate('items.product', 'name images');

        return result;
    }
}
