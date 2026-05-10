import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { SpinHistory, SpinHistorySchema } from './schemas/spin-history.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpinHistory.name, schema: SpinHistorySchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
