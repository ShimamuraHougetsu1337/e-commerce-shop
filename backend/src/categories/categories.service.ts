import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: SoftDeleteModel<CategoryDocument>
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    let baseSlug = createCategoryDto.slug;
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await this.categoryModel.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    createCategoryDto.slug = uniqueSlug;

    return await this.categoryModel.create(createCategoryDto);
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+current - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.categoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.categoryModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }
    return category;
  }

  async update(updateCategoryDto: UpdateCategoryDto & { id: string }) {
    if (updateCategoryDto.slug) {
      const existing = await this.categoryModel.findOne({
        slug: updateCategoryDto.slug,
        _id: { $ne: updateCategoryDto.id }
      });
      if (existing) {
        throw new BadRequestException('Đường dẫn (Slug) này đã tồn tại!');
      }
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      updateCategoryDto.id,
      updateCategoryDto,
      { new: true }
    );

    if (!updatedCategory) {
      throw new NotFoundException(`Không thể cập nhật. Không tìm thấy ID: ${updateCategoryDto.id}`);
    }

    return updatedCategory;
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const result = await this.categoryModel.softDelete({ _id: id });

    return {
      message: `Đã xóa thành công danh mục: ${category.name}`,
      result
    };
  }
}
