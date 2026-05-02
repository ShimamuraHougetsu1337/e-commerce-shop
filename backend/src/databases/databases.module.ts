import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '@/products/schemas/product.schema';
import { Category, CategorySchema } from '@/categories/schemas/category.schema';
import { Review, ReviewSchema } from '@/reviews/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule { }
