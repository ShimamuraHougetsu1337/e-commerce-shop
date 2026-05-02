
import { IsArray, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsMongoId({ message: 'productId không hợp lệ' })
    @IsNotEmpty({ message: 'productId không được để trống' })
    productId: string;

    @IsInt({ message: 'rating phải là số nguyên' })
    @Min(1, { message: 'rating tối thiểu là 1' })
    @Max(5, { message: 'rating tối đa là 5' })
    @IsNotEmpty({ message: 'rating không được để trống' })
    rating: number;

    @IsString({ message: 'comment phải là chuỗi' })
    @IsNotEmpty({ message: 'comment không được để trống' })
    comment: string;

    @IsOptional()
    @IsArray({ message: 'images phải là một mảng chuỗi' })
    @IsString({ each: true, message: 'mỗi hình ảnh phải là một chuỗi' })
    images?: string[];
}
