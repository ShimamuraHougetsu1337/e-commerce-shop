import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SpinHistory, SpinHistoryDocument } from './schemas/spin-history.schema';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import dayjs from 'dayjs';

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(SpinHistory.name) private spinHistoryModel: Model<SpinHistoryDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) { }

  async checkCanSpin(userId: string) {
    const today = dayjs().format('YYYY-MM-DD');
    const history = await this.spinHistoryModel.findOne({ userId, spinDate: today });
    return !history;
  }

  async performSpin(userId: string) {
    const canSpin = await this.checkCanSpin(userId);
    if (!canSpin) {
      throw new BadRequestException('Bạn đã thực hiện vòng quay hôm nay rồi. Hãy quay lại vào ngày mai!');
    }

    // Predefined Prizes
    const prizes = [
      { type: 'COUPON', label: 'Voucher 5%', value: 'PERCENT_5', chance: 30, discountType: 'PERCENTAGE', discountValue: 5 },
      { type: 'COUPON', label: 'Voucher 10%', value: 'PERCENT_10', chance: 15, discountType: 'PERCENTAGE', discountValue: 10 },
      { type: 'COUPON', label: 'Voucher 20k', value: 'FIXED_20', chance: 20, discountType: 'FIXED', discountValue: 20000 },
      { type: 'COUPON', label: 'Voucher 50k', value: 'FIXED_50', chance: 5, discountType: 'FIXED', discountValue: 50000 },
      { type: 'NONE', label: 'Chúc bạn may mắn lần sau', value: 'NONE', chance: 30 },
    ];

    // Simple weighted random selection
    const totalChance = prizes.reduce((acc, p) => acc + p.chance, 0);
    let random = Math.random() * totalChance;
    let selectedPrize = prizes[prizes.length - 1];

    for (const prize of prizes) {
      if (random < prize.chance) {
        selectedPrize = prize;
        break;
      }
      random -= prize.chance;
    }

    let rewardInfo = {
      type: selectedPrize.type as 'COUPON' | 'NONE',
      value: selectedPrize.value,
      label: selectedPrize.label,
    };

    if (selectedPrize.type === 'COUPON') {
      // Create a unique coupon for this user
      const code = `SPIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await this.couponModel.create({
        code,
        discountType: selectedPrize.discountType,
        discountValue: selectedPrize.discountValue,
        minOrderValue: 100000, // Minimal requirement
        maxUsage: 1,
        usedCount: 0,
        expiryDate: dayjs().add(3, 'day').toDate(), // Valid for 3 days
        isActive: true,
        assignedTo: userId, // Restrict usage to this user
      });
      rewardInfo.value = code;
    }

    // Save history
    await this.spinHistoryModel.create({
      userId,
      spinDate: dayjs().format('YYYY-MM-DD'),
      reward: rewardInfo,
    });

    return {
      success: true,
      reward: rewardInfo,
      prizeIndex: prizes.indexOf(selectedPrize)
    };
  }

  async getHistory(userId: string) {
    return this.spinHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(10);
  }
}
