import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsNotEmpty({ message: 'ID không được để trống' })
    @IsMongoId({ message: 'ID không hợp lệ' })
    id: string
}
