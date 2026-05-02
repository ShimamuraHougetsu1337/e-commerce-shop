import { IUser } from '@/decorator/customize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddToCartDto } from './dto/cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartsService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>
    ) { }

    async getCart(user: IUser) {
        const cart = await this.cartModel.findOne({ user: user._id })
            .populate('items.product')
            .lean();

        return cart?.items ?? [];
    }

    async addToCart(user: IUser, addToCartDto: AddToCartDto) {
        const { product, quantity } = addToCartDto;
        let cart = await this.cartModel.findOne({ user: user._id });

        if (!cart) {
            await this.cartModel.create({
                user: user._id,
                items: [{ product, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product?.toString() === product);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: product as any, quantity });
            }
            await cart.save();
        }

        return this.getCart(user);
    }

    async updateQuantity(user: IUser, updateDto: AddToCartDto) {
        const { product, quantity } = updateDto;
        const cart = await this.cartModel.findOne({ user: user._id });

        if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

        const itemIndex = cart.items.findIndex(item => item.product?.toString() === product);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
        }

        return this.getCart(user);
    }

    async removeFromCart(user: IUser, productId: string) {
        const cart = await this.cartModel.findOne({ user: user._id });
        if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

        cart.items = cart.items.filter(item => item.product?.toString() !== productId);
        await cart.save();

        return this.getCart(user);
    }

    async clearCart(user: IUser) {
        const cart = await this.cartModel.findOne({ user: user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return [];
    }
}
