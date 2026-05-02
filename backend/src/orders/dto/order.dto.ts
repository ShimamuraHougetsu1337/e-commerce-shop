
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class CreateOrderItemDto {
    @IsMongoId({ message: 'product phải là MongoDB ObjectId hợp lệ' })
    @IsNotEmpty({ message: 'product không được để trống' })
    product: string;

    @IsString({ message: 'productName phải là chuỗi' })
    @IsNotEmpty({ message: 'productName không được để trống' })
    productName: string;

    @IsNumber({}, { message: 'quantity phải là số' })
    @Min(1, { message: 'quantity phải ít nhất là 1' })
    quantity: number;

    @IsNumber({}, { message: 'price phải là số' })
    @Min(0, { message: 'price không được âm' })
    price: number;
}

export class CreateOrderDto {
    @IsArray({ message: 'items phải là mảng' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @IsNumber({}, { message: 'totalAmount phải là số' })
    @Min(0, { message: 'totalAmount không được âm' })
    totalAmount: number;

    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsOptional()
    @IsNumber()
    discountValue?: number;

    @IsOptional()
    @IsString()
    discountType?: string;

    @IsOptional()
    @IsNumber()
    minOrderValue?: number;
}

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus, { message: 'status không hợp lệ' })
    @IsNotEmpty()
    status: OrderStatus;
}
