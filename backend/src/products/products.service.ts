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

    const res = await this.productModel.create(productData);

    // Tự động tạo Vector sau khi tạo sản phẩm thành công (chạy ngầm)
    if (res.images && res.images.length > 0) {
      this.generateVectorForProduct(res._id.toString(), res.images[0]);
    }

    return res;
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
    const res = await product.save();

    // Nếu cập nhật có thay đổi ảnh, cập nhật lại Vector
    if (updateProductDto.images && updateProductDto.images.length > 0) {
      this.generateVectorForProduct(updateProductDto.id, updateProductDto.images[0]);
    }

    return res;
  }

  // Hàm helper chạy ngầm để không làm chậm request của user
  private async generateVectorForProduct(productId: string, imageUrl: string) {
    try {
      let imageBuffer: Buffer;
      if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl);
        imageBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(process.cwd(), 'public', 'images', 'product', imageUrl);
        if (fs.existsSync(filePath)) {
          imageBuffer = fs.readFileSync(filePath);
        } else {
          return;
        }
      }

      const mockFile = { buffer: imageBuffer, mimetype: 'image/jpeg' } as Express.Multer.File;
      const vector = await this.imageToVector(mockFile);
      await this.productModel.updateOne({ _id: productId }, { image_vector: vector });
      console.log(`Auto-generated vector for product: ${productId}`);
    } catch (err) {
      console.error(`Error auto-generating vector for ${productId}:`, err);
    }
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
      // 1. Tạo Vector từ ảnh vừa upload
      const queryVector = await this.imageToVector(file);

      // 2. Thực hiện Vector Search trong MongoDB Atlas
      // Lưu ý: Cần tạo Vector Index trên Atlas với tên "vector_index" trước
      const products = await this.productModel.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index", 
            "path": "image_vector",
            "queryVector": queryVector,
            "numCandidates": 100,
            "limit": 10
          }
        } as any,
        {
          "$match": { "isActive": true }
        },
        {
          "$project": {
            "name": 1, "price": 1, "images": 1, "slug": 1,
            "score": { "$meta": "vectorSearchScore" }
          }
        }
      ]);

      return {
        keyword: "Tìm kiếm bằng thị giác",
        result: products
      };
    } catch (error) {
      console.error("Vector search error:", error);
      // Fallback về tìm kiếm text nếu Vector Search chưa được cấu hình Index trên Atlas
      return this.searchByImageLegacy(file);
    }
  }

  // Hàm phụ trợ để chuyển ảnh thành Vector (Sử dụng Embedding qua Text Description)
  private async imageToVector(file: Express.Multer.File): Promise<number[]> {
    const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const embeddingModel = this.genAI.getGenerativeModel({ model: 'models/embedding-001' }); // Thêm tiền tố models/

    const imagePart = {
      inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype },
    };

    // Bước 1: Trích xuất đặc điểm thị giác cực kỳ chi tiết
    const prompt = "Hãy mô tả cực kỳ chi tiết các đặc điểm thị giác của sản phẩm này: loại sản phẩm, hình dáng, màu sắc chủ đạo, chất liệu, hoa văn. Trả về dưới dạng một đoạn văn ngắn.";
    const visionResult = await visionModel.generateContent([prompt, imagePart]);
    const visualDescription = visionResult.response.text();

    // Bước 2: Chuyển đoạn mô tả đó thành Vector
    const embeddingResult = await embeddingModel.embedContent(visualDescription);
    return embeddingResult.embedding.values;
  }

  // API đồng bộ Vector cho toàn bộ sản phẩm cũ
  async syncVectors() {
    const products = await this.productModel.find({ 
      images: { $exists: true, $not: { $size: 0 } },
      isActive: true 
    });

    let count = 0;
    for (const product of products) {
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < 3) {
        console.log(`---> Đang xử lý sản phẩm: ${product.name} (Lần thử: ${retryCount + 1})...`);
        try {
          // Giả sử lấy ảnh đầu tiên để tạo Vector
          const imageUrl = product.images[0];
          let imageBuffer: Buffer;

          if (imageUrl.startsWith('http')) {
            const response = await fetch(imageUrl);
            imageBuffer = Buffer.from(await response.arrayBuffer());
          } else {
            const path = require('path');
            const fs = require('fs');
            const filePath = path.join(process.cwd(), 'public', 'images', 'product', imageUrl);
            if (fs.existsSync(filePath)) {
              imageBuffer = fs.readFileSync(filePath);
            } else {
              success = true; // Bỏ qua nếu không thấy file
              continue;
            }
          }

          const mockFile = { buffer: imageBuffer, mimetype: 'image/jpeg' } as Express.Multer.File;
          const vector = await this.imageToVector(mockFile);
          await this.productModel.updateOne(
            { _id: product._id },
            { image_vector: vector }
          );
          count++;
          console.log(`✅ Thành công: ${product.name} (${count}/${products.length})`);
          success = true;

          // Nghỉ 5 giây để tránh dính Rate Limit tiếp theo
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (err: any) {
          if (err.status === 429) {
            console.warn(`⚠️ Bị giới hạn tốc độ. Đang đợi 20 giây để thử lại...`);
            await new Promise(resolve => setTimeout(resolve, 20000)); // Đợi 20s theo yêu cầu của Google
            retryCount++;
          } else {
            console.error(`❌ Lỗi sản phẩm ${product.name}:`, err.message);
            success = true; // Bỏ qua lỗi khác để chạy tiếp
          }
        }
      }
    }

    return { message: `Đã đồng bộ thành công ${count} sản phẩm.` };
  }

  // Giữ lại hàm cũ để fallback nếu chưa tạo Index
  async searchByImageLegacy(file: Express.Multer.File) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const imagePart = {
        inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype },
      };
      const prompt = "Đây là sản phẩm gì? Hãy trả về tên sản phẩm ngắn gọn nhất có thể (dưới 5 từ) để tôi dùng tìm kiếm trong database.";
      const result = await model.generateContent([prompt, imagePart]);
      const text = (await result.response).text().trim();

      const products = await this.productModel
        .find({ $text: { $search: text }, isActive: true })
        .limit(10)
        .populate('category')
        .exec();

      return { keyword: text, result: products };
    } catch (error) {
      throw new InternalServerErrorException("Lỗi xử lý tìm kiếm bằng hình ảnh");
    }
  }
}