import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Model } from 'mongoose';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon, CouponDocument } from './schemas/coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    if (
      createCouponDto.discountType === 'PERCENTAGE' &&
      createCouponDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Mức giảm giá theo phần trăm không được vượt quá 100%',
      );
    }

    const isExist = await this.couponModel.findOne({
      code: createCouponDto.code.toUpperCase(),
    });
    if (isExist) {
      throw new BadRequestException(
        `Mã giảm giá ${createCouponDto.code} đã tồn tại`,
      );
    }
    try {
      const coupon = await this.couponModel.create({
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
      });
      return coupon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Mã giảm giá ${createCouponDto.code} đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.couponModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.couponModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) throw new NotFoundException('Không tìm thấy mã giảm giá');
    return coupon;
  }

  async findActive(userId?: string) {
    const query: any = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ['$usedCount', '$maxUsage'] },
    };

    const visibilityCondition = userId
      ? {
          $or: [
            { assignedTo: { $exists: false } },
            { assignedTo: null },
            { assignedTo: userId },
          ],
        }
      : { $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }] };

    const hideLegacySpinCondition = {
      $or: [
        { code: { $not: /^SPIN-/ } },
        { assignedTo: { $exists: true, $ne: null } },
      ],
    };

    query.$and = [visibilityCondition, hideLegacySpinCondition];
    return this.couponModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async applyCoupon(code: string, orderValue: number, userId: string) {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Mã giảm giá đã bị khóa');
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    if (coupon.usedBy && coupon.usedBy.some((id) => id.toString() === userId)) {
      throw new BadRequestException('Bạn đã sử dụng mã giảm giá này rồi');
    }

    if (coupon.code.startsWith('SPIN-') && !coupon.assignedTo) {
      throw new BadRequestException(
        'Mã giảm giá này đã cũ và không còn hợp lệ',
      );
    }

    if (
      coupon.assignedTo &&
      coupon.assignedTo.toString() !== userId.toString()
    ) {
      throw new BadRequestException(
        'Mã giảm giá này không dành cho tài khoản của bạn',
      );
    }

    if (coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    if (orderValue < coupon.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng phải từ ${coupon.minOrderValue}đ để áp dụng mã này`,
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = orderValue * (coupon.discountValue / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    return {
      coupon,
      discountAmount,
      finalTotal: Math.max(0, orderValue - discountAmount),
    };
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const currentCoupon = await this.couponModel.findById(id);
    if (!currentCoupon)
      throw new NotFoundException('Không tìm thấy mã giảm giá');

    const newType = updateCouponDto.discountType || currentCoupon.discountType;
    const newValue =
      updateCouponDto.discountValue !== undefined
        ? updateCouponDto.discountValue
        : currentCoupon.discountValue;

    if (newType === 'PERCENTAGE' && newValue > 100) {
      throw new BadRequestException(
        'Mức giảm giá theo phần trăm không được vượt quá 100%',
      );
    }

    if (updateCouponDto.code) {
      const isExist = await this.couponModel.findOne({
        code: updateCouponDto.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (isExist) {
        throw new BadRequestException(
          `Mã giảm giá ${updateCouponDto.code} đã tồn tại`,
        );
      }
      updateCouponDto.code = updateCouponDto.code.toUpperCase();
    }

    currentCoupon.set(updateCouponDto);
    try {
      return await currentCoupon.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Mã giảm giá ${updateCouponDto.code} đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    return this.couponModel.findByIdAndDelete(id);
  }
}
