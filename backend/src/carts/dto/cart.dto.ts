
import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @IsNotEmpty({ message: 'ProductId không được để trống' })
    @IsMongoId({ message: 'ProductId không hợp lệ' })
    product: string;

    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(1, { message: 'Số lượng tối thiểu là 1' })
    quantity: number;
}

export class SyncCartDto {
    @IsNotEmpty()
    items: AddToCartDto[];
}
