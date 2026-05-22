import { Coupon, CouponDocument } from '@/coupons/schemas/coupon.schema';
import { IUser } from '@/decorator/customize';
import { MailService } from '@/mail/mail.service';
import { NotificationsGateway } from '@/notifications/notifications.gateway';
import { NotificationsService } from '@/notifications/notifications.service';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import aqp from 'api-query-params';
import mongoose, { Connection, Model } from 'mongoose';
import { CreateOrderDto } from './dto/order.dto';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';

interface ReturnQueryFromVNPay {
  vnp_TxnRef: string;
  vnp_Amount: string | number;
  vnp_ResponseCode: string;
  [key: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
import VNPayModule = require('vnpay');
const { VNPay } = VNPayModule;

@Injectable()
export class OrdersService {
  private vnpay: any;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: Connection,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    private configService: ConfigService,
  ) {
    this.vnpay = new VNPay({
      tmnCode: this.configService.get<string>('VNP_TMN_CODE') || '2QXG2YX1',
      secureSecret:
        this.configService.get<string>('VNP_HASH_SECRET') ||
        'GET851608620215GET851608620215',
      vnpayHost:
        this.configService
          .get<string>('VNP_URL')
          ?.replace('/paymentv2/vpcpay.html', '') ||
        'https://sandbox.vnpayment.vn',
    });
  }

  async createOrder(
    user: IUser,
    createOrderDto: CreateOrderDto,
    ipAddress?: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Kiểm tra tồn kho của tất cả sản phẩm trong đơn hàng (Fail fast)
      for (const item of createOrderDto.items) {
        const product = await this.productModel
          .findById(item.product)
          .session(session);
        if (!product) {
          throw new NotFoundException(
            `Sản phẩm ${item.productName} không tồn tại`,
          );
        }
        if (product.stock_quantity < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${item.productName} không đủ số lượng trong kho (Còn lại: ${product.stock_quantity})`,
          );
        }
      }

      // 2. Tạo đơn hàng
      const orderArray = await this.orderModel.create(
        [
          {
            userId: user._id,
            ...createOrderDto,
            status: OrderStatus.PENDING,
            timeline: [
              {
                status: OrderStatus.PENDING,
                note: 'Đơn hàng đã được khởi tạo thành công',
                timestamp: new Date(),
                actionBy: user._id,
              },
            ],
          },
        ],
        { session },
      );
      const order = orderArray[0];

      // 3. Cập nhật số lượng tồn kho (Sử dụng Atomic Update với check điều kiện)
      for (const item of createOrderDto.items) {
        const updateResult = await this.productModel.updateOne(
          {
            _id: item.product,
            stock_quantity: { $gte: item.quantity }, // Điều kiện quan trọng để tránh Race Condition
          },
          { $inc: { stock_quantity: -item.quantity } },
          { session },
        );

        if (updateResult.modifiedCount === 0) {
          throw new BadRequestException(
            `Sản phẩm ${item.productName} vừa mới hết hàng hoặc không đủ số lượng. Vui lòng kiểm tra lại!`,
          );
        }
      }

      // 4. Xử lý Coupon nếu có
      if (createOrderDto.couponCode) {
        const coupon = await this.couponModel
          .findOne({
            code: createOrderDto.couponCode.toUpperCase(),
            isActive: true,
            expiryDate: { $gte: new Date() },
          })
          .session(session);

        if (!coupon) {
          throw new BadRequestException(
            'Mã giảm giá không tồn tại hoặc đã hết hạn',
          );
        }

        if (coupon.usedCount >= coupon.maxUsage) {
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
        }

        if (coupon.code.startsWith('SPIN-') && !coupon.assignedTo) {
          throw new BadRequestException(
            'Mã giảm giá này đã cũ và không còn hợp lệ',
          );
        }

        if (
          coupon.assignedTo &&
          String(coupon.assignedTo) !== String(user._id)
        ) {
          throw new BadRequestException(
            'Mã giảm giá này không dành cho tài khoản của bạn',
          );
        }

        await this.couponModel.updateOne(
          { _id: coupon._id, usedCount: { $lt: coupon.maxUsage } },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: user._id },
          },
          { session },
        );
      }

      // Commit transaction
      await session.commitTransaction();

      // 5. Gửi email xác nhận (không làm gián đoạn luồng chính)
      const fullUser = await this.userModel.findById(user._id);
      void this.mailService.sendOrderConfirmation(order, fullUser || user);

      // 6. Gửi thông báo realtime cho user
      const { type, title, message } =
        this.notificationsService.buildOrderNotification(
          OrderStatus.PENDING,
          order._id.toString(),
        );
      const notification = await this.notificationsService.createForUser(
        user._id,
        type,
        title,
        message,
        order._id.toString(),
      );
      this.notificationsGateway.sendToUser(user._id, notification);

      // 7. Thông báo cho Admin có đơn hàng mới
      const adminNotif = await this.notificationsService.createForUser(
        user._id,
        type, // Hoặc NotificationType.NEW_ORDER_ADMIN
        '🛍️ Có đơn hàng mới!',
        `Khách hàng vừa đặt đơn hàng #${order._id.toString().slice(-6).toUpperCase()} — ${order.totalAmount.toLocaleString('vi-VN')}đ`,
        order._id.toString(),
      );
      this.notificationsGateway.sendToAdmins(adminNotif);

      // Tạo URL VNPAY nếu phương thức thanh toán là VNPAY
      let paymentUrl: string | null = null;
      if (createOrderDto.paymentMethod === 'VNPAY') {
        paymentUrl = this.createVnpayPaymentUrl(
          ipAddress || '127.0.0.1',
          order._id.toString(),
          order.totalAmount,
        );
      }

      return { order, paymentUrl };
    } catch (error) {
      // Abort transaction if any error occurs
      await session.abortTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình xử lý đơn hàng: ' +
          (error as Error).message,
      );
    } finally {
      await session.endSession();
    }
  }

  createVnpayPaymentUrl(
    ipAddress: string,
    orderId: string,
    amount: number,
  ): string {
    const returnUrl =
      this.configService.get<string>('VNP_RETURN_URL') ||
      'http://localhost:3000/order/vnpay-return';

    return this.vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100,
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: 'Thanh toan cho don hang #' + orderId,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: 'vn',
    }) as string;
  }

  async handleVnpayIpn(query: ReturnQueryFromVNPay) {
    try {
      const verify = this.vnpay.verifyIpnCall(query);

      if (!verify.isVerified) {
        return { RspCode: '97', Message: 'Invalid checksum' };
      }

      const orderId = query.vnp_TxnRef;
      const amount = parseFloat(String(query.vnp_Amount)) / 100;
      const responseCode = query.vnp_ResponseCode;

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      if (order.totalAmount !== amount) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      if (order.status !== OrderStatus.PENDING) {
        return { RspCode: '02', Message: 'Order already confirmed' };
      }

      if (verify.isSuccess) {
        order.status = OrderStatus.CONFIRMED;
        order.timeline.push({
          status: OrderStatus.CONFIRMED,
          note: 'Thanh toán thành công qua VNPAY (IPN)',
          timestamp: new Date(),
          actionBy: order.userId,
        });
        await order.save();

        // Gửi thông báo realtime cho user
        const { type, title, message } =
          this.notificationsService.buildOrderNotification(
            OrderStatus.CONFIRMED,
            order._id.toString(),
          );
        const notification = await this.notificationsService.createForUser(
          String(order.userId),
          type,
          title,
          message,
          order._id.toString(),
        );
        this.notificationsGateway.sendToUser(
          String(order.userId),
          notification,
        );

        return { RspCode: '00', Message: 'Confirm success' };
      } else {
        order.status = OrderStatus.CANCELLED;
        order.timeline.push({
          status: OrderStatus.CANCELLED,
          note: 'Thanh toán VNPAY thất bại với mã lỗi ' + responseCode,
          timestamp: new Date(),
          actionBy: order.userId,
        });
        await order.save();
        return {
          RspCode: '00',
          Message: 'Confirm success (Transaction failed)',
        };
      }
    } catch (error) {
      console.error('IPN processing error:', error);
      return { RspCode: '99', Message: 'Input required data invalid' };
    }
  }

  async verifyVnpayPayment(query: ReturnQueryFromVNPay) {
    try {
      const verify = this.vnpay.verifyReturnUrl(query);

      if (!verify.isVerified) {
        return { success: false, message: 'Chữ ký không hợp lệ' };
      }

      const orderId = query.vnp_TxnRef;
      const responseCode = query.vnp_ResponseCode;

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        return { success: false, message: 'Không tìm thấy đơn hàng' };
      }

      if (verify.isSuccess) {
        if (order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.CONFIRMED;
          order.timeline.push({
            status: OrderStatus.CONFIRMED,
            note: 'Thanh toán thành công qua VNPAY (Return page)',
            timestamp: new Date(),
            actionBy: order.userId,
          });
          await order.save();

          // Gửi thông báo realtime cho user
          const { type, title, message } =
            this.notificationsService.buildOrderNotification(
              OrderStatus.CONFIRMED,
              order._id.toString(),
            );
          const notification = await this.notificationsService.createForUser(
            String(order.userId),
            type,
            title,
            message,
            order._id.toString(),
          );
          this.notificationsGateway.sendToUser(
            String(order.userId),
            notification,
          );
        }
        return { success: true, message: 'Thanh toán thành công', order };
      } else {
        if (order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.CANCELLED;
          order.timeline.push({
            status: OrderStatus.CANCELLED,
            note: 'Thanh toán VNPAY thất bại với mã lỗi ' + responseCode,
            timestamp: new Date(),
            actionBy: order.userId,
          });
          await order.save();
        }
        return { success: false, message: 'Thanh toán thất bại', order };
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xác thực giao dịch',
      };
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
    const { filter, sort, population } = aqp(qs) as {
      filter: Record<string, any>;
      sort: Record<string, any>;
      population: any;
    };
    delete filter.current;
    delete filter.pageSize;

    // Xử lý tìm kiếm thông minh từ query parameter
    if (filter.query) {
      const queryStr = String(filter.query);
      delete filter.query;

      if (mongoose.isValidObjectId(queryStr)) {
        // Nếu là ID hợp lệ, tìm theo Order ID chính xác
        filter._id = queryStr;
      } else {
        // Tìm kiếm người dùng có tên hoặc email khớp với từ khóa
        const users = await this.userModel
          .find({
            $or: [
              { name: { $regex: queryStr, $options: 'i' } },
              { email: { $regex: queryStr, $options: 'i' } },
            ],
          })
          .select('_id');

        const userIds = users.map((u) => u._id);

        // Kết hợp tìm kiếm: theo danh sách userIds HOẶC theo địa chỉ, phương thức thanh toán HOẶC phần nào đó của ID
        filter.$or = [
          { userId: { $in: userIds } },
          { shippingAddress: { $regex: queryStr, $options: 'i' } },
          { paymentMethod: { $regex: queryStr, $options: 'i' } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$_id' },
                regex: queryStr,
                options: 'i',
              },
            },
          },
        ];
      }
    }

    const offset = (+current - 1) * +pageSize;
    const defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.orderModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.orderModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .populate(population)
      .populate('userId', 'name email phone')
      .exec();

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    user: IUser,
    note?: string,
  ) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    // Logic kiểm tra chuyển đổi trạng thái (Optional nhưng chuyên sâu)
    // Ví dụ: Không cho phép chuyển từ Cancelled sang status khác
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể cập nhật trạng thái cho đơn hàng đã bị hủy',
      );
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Đơn hàng đã hoàn thành, không thể thay đổi trạng thái',
      );
    }

    const timelineEntry = {
      status,
      note: note || `Cập nhật trạng thái: ${status}`,
      timestamp: new Date(),
      actionBy: user._id,
    };

    const result = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          status,
          $push: { timeline: timelineEntry },
        },
        { new: true },
      )
      .populate('items.product', 'name images');

    // Gửi thông báo realtime cho chủ đơn hàng
    const userId = String(order.userId);
    const { type, title, message } =
      this.notificationsService.buildOrderNotification(status, id);
    const notification = await this.notificationsService.createForUser(
      userId,
      type,
      title,
      message,
      id,
    );
    this.notificationsGateway.sendToUser(userId, notification);

    return result;
  }
}
