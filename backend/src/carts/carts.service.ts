import { IUser } from '@/decorator/customize';
import { Product, ProductDocument } from '@/products/schemas/product.schema';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddToCartDto } from './dto/cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartsService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>
    ) { }

    async getCart(user: IUser) {
        const cart = await this.cartModel.findOne({ user: user._id })
            .populate('items.product')
            .lean();

        return cart?.items ?? [];
    }

    async addToCart(user: IUser, addToCartDto: AddToCartDto) {
        const { product: productId, quantity } = addToCartDto;

        // Kiểm tra tồn kho trước khi thêm
        const product = await this.productModel.findById(productId);
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
        if (product.stock_quantity < quantity) {
            throw new BadRequestException(`Sản phẩm không đủ số lượng (Còn lại: ${product.stock_quantity})`);
        }

        let cart = await this.cartModel.findOne({ user: user._id });

        if (!cart) {
            await this.cartModel.create({
                user: user._id,
                items: [{ product: productId, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product?.toString() === productId);

            if (itemIndex > -1) {
                // Kiểm tra tổng số lượng sau khi cộng thêm
                const newQuantity = cart.items[itemIndex].quantity + quantity;
                if (product.stock_quantity < newQuantity) {
                    throw new BadRequestException(`Tổng số lượng trong giỏ hàng vượt quá hàng tồn kho (Còn lại: ${product.stock_quantity})`);
                }
                cart.items[itemIndex].quantity = newQuantity;
            } else {
                cart.items.push({ product: productId as any, quantity });
            }
            await cart.save();
        }

        return this.getCart(user);
    }

    async updateQuantity(user: IUser, updateDto: AddToCartDto) {
        const { product: productId, quantity } = updateDto;

        // Kiểm tra tồn kho trước khi cập nhật
        const product = await this.productModel.findById(productId);
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
        if (product.stock_quantity < quantity) {
            throw new BadRequestException(`Sản phẩm không đủ số lượng (Còn lại: ${product.stock_quantity})`);
        }

        const cart = await this.cartModel.findOne({ user: user._id });
        if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

        const itemIndex = cart.items.findIndex(item => item.product?.toString() === productId);
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
