import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatModule } from './chat/chat.module';
import { CouponsModule } from './coupons/coupons.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabasesModule } from './databases/databases.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { GamificationModule } from './gamification/gamification.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        }
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    DatabasesModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartsModule,
    OrdersModule,
    ReviewsModule,
    ChatModule,
    DashboardModule,
    FilesModule,
    CouponsModule,
    MailModule,
    GamificationModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
