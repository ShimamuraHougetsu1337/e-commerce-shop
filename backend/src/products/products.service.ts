import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      baseURL: this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434/v1',
      apiKey: 'ollama',
    });
  }

  async create(createProductDto: CreateProductDto) {
    const baseSlug = createProductDto.slug;
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
      category: createProductDto.category_id,
    };

    const res = await this.productModel.create(productData);

    return res;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Tìm kiếm linh hoạt (OR logic): Chỉ cần khớp 1 trong các từ, nhưng CHỈ tìm trong TÊN
    if (filter.name) {
      const keyword = filter.name
        .toString()
        .replace(/\//g, '')
        .replace(/i$/, '')
        .trim();
      const words = keyword.split(/\s+/).filter((w) => w.length > 0);

      // Tạo pattern: từ1|từ2|từ3... (Khớp ít nhất 1 từ)
      const regexPattern = words.join('|');
      filter.name = { $regex: regexPattern, $options: 'i' };
    }

    const offset = (+current - 1) * +pageSize;
    const defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.productModel
      .find(filter)
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
        total: totalItems,
      },
      result,
    };
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
        _id: { $ne: updateProductDto.id },
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
      throw new NotFoundException(
        `Không thể cập nhật. Không tìm thấy ID: ${updateProductDto.id}`,
      );
    }

    product.set(updateData);
    const res = await product.save();

    return res;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    const result = await this.productModel.softDelete({ _id: id });

    return {
      message: `Đã xóa thành công sản phẩm: ${product.name}`,
      result,
    };
  }

  async searchByImage(file: Express.Multer.File) {
    try {
      const base64Image = file.buffer.toString('base64');

      // 1. Dùng model Vision để mô tả bức ảnh (Dùng tiếng Anh để Moondream nhận diện chính xác nhất)
      const visionResponse = await this.openai.chat.completions.create({
        model: 'moondream',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What is the generic category of this item? Ignore all text, labels, and brand names on the packaging. Describe only its shape, color, and what kind of product it is (e.g., "cooking oil in a plastic bottle", "black jacket"). Keep it under 10 words.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });

      const description = visionResponse.choices[0]?.message?.content || '';

      // 2. Dùng Qwen3 để dịch và trích xuất từ khóa tiếng Việt từ mô tả tiếng Anh
      const keywordResponse = await this.openai.chat.completions.create({
        model: 'qwen3:4b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are an expert E-commerce product keyword extractor. 
Based on the English description, return ONLY the generic product name in VIETNAMESE (maximum 3 words) for database searching. 
CRITICAL RULES:
1. Ignore any brand names (like Neptune, Logitech, Apple).
2. Ignore weird numbers or percentages (like 65%, 500ml) unless it's a clothing size.
3. Example 1: "A bottle of Neptune cooking oil that withstands high temps" -> "dầu ăn"
4. Example 2: "Black wireless gaming mouse" -> "chuột không dây"
5. Example 3: "A red cotton t-shirt" -> "áo thun đỏ"`,
          },
          { role: 'user', content: `Description: ${description}` },
        ],
      });

      const text = keywordResponse.choices[0]?.message?.content?.trim() || '';

      // 3. Thực hiện tìm kiếm trong database (Chỉ tìm theo tên sản phẩm)
      const products = await this.productModel
        .find({
          name: { $regex: text, $options: 'i' },
          isActive: true,
        })
        .limit(10)
        .populate('category')
        .exec();

      return {
        description: description,
        keyword: text,
        result: products,
      };
    } catch (error) {
      console.error('Local Image search error:', error);
      throw new InternalServerErrorException(
        'Lỗi xử lý tìm kiếm bằng hình ảnh tại local',
      );
    }
  }

  // API đồng bộ Vector đã tắt vì sử dụng Local Ollama
  async syncVectors() {
    return {
      message:
        'Đồng bộ vector đã bị tắt do hệ thống đang sử dụng tìm kiếm bằng Local Ollama.',
    };
  }
}
