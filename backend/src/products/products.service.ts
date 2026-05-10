import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>
  ) { }

  async create(createProductDto: CreateProductDto) {
    let baseSlug = createProductDto.slug;
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await this.productModel.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    createProductDto.slug = uniqueSlug;

    // Map category_id to category for Schema
    const productData = {
      ...createProductDto,
      category: createProductDto.category_id
    };

    return await this.productModel.create(productData);
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+current - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.productModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population || 'category') // Default populate category
      .exec();

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }
  async findOne(id: string) {
    const product = await this.productModel.findById(id).populate('category');

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
    }
    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    if (updateProductDto.slug) {
      const existing = await this.productModel.findOne({
        slug: updateProductDto.slug,
        _id: { $ne: updateProductDto.id }
      });
      if (existing) {
        throw new BadRequestException('Đường dẫn (Slug) này đã tồn tại!');
      }
    }

    // Map category_id to category for Schema if present
    const updateData: any = { ...updateProductDto };
    if (updateProductDto.category_id) {
      updateData.category = updateProductDto.category_id;
    }

    const product = await this.productModel.findById(updateProductDto.id);
    if (!product) {
      throw new NotFoundException(`Không thể cập nhật. Không tìm thấy ID: ${updateProductDto.id}`);
    }

    product.set(updateData);
    return await product.save();
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    const result = await this.productModel.softDelete({ _id: id });

    return {
      message: `Đã xóa thành công sản phẩm: ${product.name}`,
      result
    };
  }
}