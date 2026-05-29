import { ADMIN_ROLE } from '@/databases/samples';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { Model } from 'mongoose';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  hashPassword = (plainPassword: string) => {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(plainPassword, salt);
    return hashedPassword;
  };

  validatePassword(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword);
  }

  async create(createUserDto: CreateUserDto) {
    const isEmailExisted = await this.userModel.exists({
      email: createUserDto.email,
    });
    if (isEmailExisted) {
      throw new BadRequestException('Email already exists');
    }
    const isUsernameExisted = await this.userModel.exists({
      name: createUserDto.name,
    });
    if (isUsernameExisted) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword = this.hashPassword(createUserDto.password);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  async createSocialUser(email: string, name: string) {
    const isEmailExisted = await this.userModel.exists({ email });
    if (isEmailExisted) {
      throw new BadRequestException('Email already exists');
    }

    // Tạo mật khẩu ngẫu nhiên cho social user
    const randomPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = this.hashPassword(randomPassword);

    const user = await this.userModel.create({
      email,
      name,
      password: hashedPassword,
      role: ADMIN_ROLE === 'SUPER_ADMIN' ? 'NORMAL_USER' : 'NORMAL_USER', // fallback to normal user
    });
    return user;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+current - 1) * +pageSize;
    const defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
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
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    return this.userModel.findById(id).populate('wishlist').select('-password');
  }

  update(updateUserDto: UpdateUserDto) {
    return this.userModel.updateOne(
      { _id: updateUserDto.id },
      {
        ...updateUserDto,
      },
    );
  }

  remove(id: string) {
    return this.userModel.softDelete({ _id: id });
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({ email }).populate('wishlist');
  }

  findOneByRefreshToken(refreshToken: string) {
    return this.userModel.findOne({ refreshToken }).populate('wishlist');
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id '${productId}' not found`);
    }
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: productId },
    });
    return { productId };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id '${productId}' not found`);
    }
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { wishlist: productId },
    });
    return { productId };
  }

  async getWishlist(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('wishlist')
      .select('wishlist')
      .lean();
    return user?.wishlist ?? [];
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      oldPassword?: string;
      newPassword?: string;
      phone?: string;
      address?: string;
      avatar?: string;
      sendOrderToEmail?: boolean;
    },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    if (data.address !== undefined) {
      updateData.address = data.address;
    }

    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }


    if (data.sendOrderToEmail !== undefined) {
      updateData.sendOrderToEmail = data.sendOrderToEmail;
    }

    if (data.oldPassword && data.newPassword) {
      const isPasswordValid = this.validatePassword(
        data.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Mật khẩu cũ không chính xác');
      }
      updateData.password = this.hashPassword(data.newPassword);
    }

    return await this.userModel.updateOne({ _id: userId }, { ...updateData });
  }

  async updateUserToken(refreshToken: string, _id: string) {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  }
}
