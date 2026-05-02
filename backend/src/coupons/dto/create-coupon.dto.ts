import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(['PERCENTAGE', 'FIXED'])
  discountType: string;

  @IsNumber()
  discountValue: number;

  @IsNumber()
  minOrderValue: number;

  @IsNumber()
  maxUsage: number;

  @IsDateString()
  expiryDate: string;
}
