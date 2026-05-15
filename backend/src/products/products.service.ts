import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

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

    // Nếu có tham số name (từ khóa search), chuyển sang sử dụng $text search để hỗ trợ tìm kiếm thông minh
    if (filter.name) {
      const keyword = filter.name.toString().replace(/\//g, '').replace(/i$/, ''); // Gỡ bỏ định dạng /.../i nếu có
      delete filter.name;
      filter.$text = { $search: keyword };
    }

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

  async searchByImage(file: Express.Multer.File) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const prompt = "Đây là sản phẩm gì? Hãy trả về tên sản phẩm ngắn gọn nhất có thể (dưới 5 từ) để tôi dùng tìm kiếm trong database.";

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();

      // Thực hiện tìm kiếm thông minh bằng $text search
      const products = await this.productModel
        .find({
          $text: { $search: text },
          isActive: true
        })
        .limit(10)
        .populate('category')
        .exec();

      return {
        keyword: text,
        result: products
      };
    } catch (error) {
      console.error("Image search error:", error);
      throw new InternalServerErrorException("Lỗi xử lý tìm kiếm bằng hình ảnh");
    }
  }
}