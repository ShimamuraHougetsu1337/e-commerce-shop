import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsString({ message: 'Slug phải là chuỗi' })
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @IsString()
  @IsOptional()
  long_description?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  price: number;

  @IsNumber({}, { message: 'Số lượng kho phải là số' })
  @Min(0, { message: 'Số lượng kho không được âm' })
  @IsOptional()
  stock_quantity?: number;

  @IsMongoId({ message: 'ID Danh mục không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng chọn danh mục cho sản phẩm' })
  category_id: string;

  @IsArray({ message: 'Hình ảnh phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi link hình ảnh phải là một chuỗi' })
  @IsOptional()
  images?: string[];

  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean (true/false)' })
  @IsOptional()
  isActive?: boolean;
}
