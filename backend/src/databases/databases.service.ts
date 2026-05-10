import { Category, CategoryDocument } from '@/categories/schemas/category.schema';
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
        @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
        @InjectModel(Category.name) private categoryModel: SoftDeleteModel<CategoryDocument>,
        @InjectModel(Review.name) private reviewModel: SoftDeleteModel<ReviewDocument>,
        @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    ) { }
    async onModuleInit() {
        this.logger.log('Đang kiểm tra dữ liệu mẫu (Seeding)...');
        const { faker } = await import('@faker-js/faker');

        try {
            // Seed Users (Admin + Normal User)
            const salt = genSaltSync(10);
            const hashedPassword = hashSync('123456', salt);

            const adminExists = await this.userModel.findOne({ email: 'admin@gmail.com' });
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

            const userExists = await this.userModel.findOne({ email: 'user@gmail.com' });
            if (!userExists) {
                await this.userModel.create({
                    name: 'User',
                    email: 'user@gmail.com',
                    password: hashedPassword,
                    role: 'NORMAL_USER',
                });
                this.logger.log('✅ Đã tạo tài khoản User (user@gmail.com / 123456)');
            } else {
                this.logger.log('Tài khoản User đã tồn tại. Bỏ qua.');
            }

            // Seed Categories
            const categoryCount = await this.categoryModel.countDocuments();
            if (categoryCount === 0) {
                await this.categoryModel.insertMany(SAMPLE_CATEGORIES);
                this.logger.log('✅ Đã tạo thành công 7 danh mục mẫu vào Database!');
            } else {
                this.logger.log(`Database đã có sẵn ${categoryCount} danh mục. Bỏ qua seeding categories.`);
            }


            // Seed Products
            const count = await this.productModel.countDocuments();

            if (count > 0) {
                this.logger.log(`Database đã có sẵn ${count} sản phẩm. Bỏ qua seeding.`);
                return;
            }

            // Lấy tất cả categories để map category_id
            const categories = await this.categoryModel.find().lean();

            const productsWithIds = SAMPLE_PRODUCTS.map(prod => {
                const category = categories.find(c => c.slug === prod.category_slug);
                return {
                    ...prod,
                    category: category?._id,
                    isActive: true
                };
            });

            const createdProducts = await this.productModel.insertMany(productsWithIds);
            this.logger.log(`✅ Đã tạo thành công ${createdProducts.length} sản phẩm mẫu!`);

            // 3. Seed Reviews for each product
            this.logger.log('Đang tạo đánh giá mẫu cho từng sản phẩm...');
            const reviewsData: any[] = [];

            for (const product of createdProducts) {
                // Tạo ngẫu nhiên 5-15 review cho mỗi sản phẩm
                const numReviews = faker.number.int({ min: 5, max: 15 });
                let totalRating = 0;

                for (let i = 0; i < numReviews; i++) {
                    const rating = faker.number.int({ min: 3, max: 5 });
                    totalRating += rating;
                    reviewsData.push({
                        userId: new Types.ObjectId(), // Tạo ID ngẫu nhiên cho mỗi review
                        productId: product._id,
                        rating: rating,
                        comment: faker.lorem.sentences(2),
                        createdAt: faker.date.past()
                    });
                }

                // Cập nhật stats ngay cho Product
                const avg = Math.round((totalRating / numReviews) * 10) / 10;
                await this.productModel.findByIdAndUpdate(product._id, {
                    averageRating: avg,
                    totalReviews: numReviews,
                });
            }

            await this.reviewModel.insertMany(reviewsData);
            this.logger.log(`✅ Đã tạo xong ${reviewsData.length} đánh giá thực tế cho các sản phẩm!`);

        } catch (error) {
            this.logger.error('❌ Lỗi trong quá trình tạo dữ liệu mẫu:', error);
        }
    }
}

