import {
  Category,
  CategoryDocument,
} from '@/categories/schemas/category.schema';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { Review, ReviewDocument } from '@/reviews/schemas/review.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import { Types } from 'mongoose';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from './samples';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);
  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>,
    @InjectModel(Review.name)
    private reviewModel: SoftDeleteModel<ReviewDocument>,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}
  async onModuleInit() {
    this.logger.log('Đang kiểm tra dữ liệu mẫu (Seeding)...');
    const { faker } = await import('@faker-js/faker');

    try {
      // Xóa unique index cũ của reviews nếu còn tồn tại
      try {
        await this.reviewModel.collection.dropIndex('userId_1_productId_1');
        this.logger.log('✅ Đã xóa unique index userId_1_productId_1 của bảng reviews.');
      } catch (err) {
        if (err.code !== 27) { // 27 = IndexNotFound
          this.logger.warn('Không thể xóa index (hoặc đã xóa): ' + err.message);
        }
      }

      // Seed Users (Admin + Normal User)
      const salt = genSaltSync(10);
      const hashedPassword = hashSync('123456', salt);

      const adminExists = await this.userModel.findOne({
        email: 'admin@gmail.com',
      });
      if (!adminExists) {
        await this.userModel.create({
          name: 'Admin',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
        });
        this.logger.log('✅ Đã tạo tài khoản Admin (admin@gmail.com / 123456)');
      } else {
        this.logger.log('Tài khoản Admin đã tồn tại. Bỏ qua.');
      }

      const userExists = await this.userModel.findOne({
        email: 'user@gmail.com',
      });
      let baseUser;
      if (!userExists) {
        baseUser = await this.userModel.create({
          name: 'User',
          email: 'user@gmail.com',
          password: hashedPassword,
          role: 'NORMAL_USER',
        });
        this.logger.log('✅ Đã tạo tài khoản User (user@gmail.com / 123456)');
      } else {
        baseUser = userExists;
        this.logger.log('Tài khoản User đã tồn tại. Bỏ qua.');
      }

      // Tạo thêm 3 user để làm reviewer thật
      const reviewerIds: string[] = [baseUser._id.toString()];
      for (let i = 1; i <= 3; i++) {
        const revEmail = `reviewer${i}@gmail.com`;
        let revUser = await this.userModel.findOne({ email: revEmail });
        if (!revUser) {
          revUser = await this.userModel.create({
            name: `Khách Hàng ${i}`,
            email: revEmail,
            password: hashedPassword,
            role: 'NORMAL_USER',
          });
          this.logger.log(`✅ Đã tạo tài khoản Reviewer (${revEmail} / 123456)`);
        }
        reviewerIds.push(revUser._id.toString());
      }

      // Seed Categories
      const categoryCount = await this.categoryModel.countDocuments();
      if (categoryCount === 0) {
        await this.categoryModel.insertMany(SAMPLE_CATEGORIES);
        this.logger.log('✅ Đã tạo thành công 7 danh mục mẫu vào Database!');
      } else {
        this.logger.log(
          `Database đã có sẵn ${categoryCount} danh mục. Bỏ qua seeding categories.`,
        );
      }

      // Seed Products
      const count = await this.productModel.countDocuments();

      if (count > 0) {
        this.logger.log(
          `Database đã có sẵn ${count} sản phẩm. Bỏ qua seeding.`,
        );
        return;
      }

      // Lấy tất cả categories để map category_id
      const categories = await this.categoryModel.find().lean();

      const productsWithIds = SAMPLE_PRODUCTS.map((prod) => {
        const category = categories.find((c) => c.slug === prod.category_slug);
        return {
          ...prod,
          category: category?._id,
          isActive: true,
        };
      });

      const createdProducts =
        await this.productModel.insertMany(productsWithIds);
      this.logger.log(
        `✅ Đã tạo thành công ${createdProducts.length} sản phẩm mẫu!`,
      );

      // 3. Seed Reviews for each product
      this.logger.log('Đang tạo đánh giá mẫu cho từng sản phẩm...');
      const reviewsData: any[] = [];

      for (const product of createdProducts) {
        // 4 user thật (bao gồm user@gmail.com và 3 reviewer), mỗi người viết 1-2 review
        let numReviews = 0;
        let totalRating = 0;
        
        for (const rId of reviewerIds) {
          const reviewsPerUser = faker.number.int({ min: 1, max: 2 });
          for (let j = 0; j < reviewsPerUser; j++) {
            const rating = faker.number.int({ min: 3, max: 5 });
            totalRating += rating;
            numReviews++;
            reviewsData.push({
              userId: new Types.ObjectId(rId), // Dùng ID thật của User
              productId: product._id,
              rating: rating,
              comment: faker.lorem.sentences(2),
              createdAt: faker.date.past(),
              status: 'APPROVED', // Cho hiển thị luôn
              isHidden: false,
            });
          }
        }

        // Cập nhật stats ngay cho Product
        const avg = Math.round((totalRating / numReviews) * 10) / 10;
        await this.productModel.findByIdAndUpdate(product._id, {
          averageRating: avg,
          totalReviews: numReviews,
        });
      }

      await this.reviewModel.insertMany(reviewsData);
      this.logger.log(
        `✅ Đã tạo xong ${reviewsData.length} đánh giá thực tế cho các sản phẩm!`,
      );
    } catch (error) {
      this.logger.error('❌ Lỗi trong quá trình tạo dữ liệu mẫu:', error);
    }
  }
}
