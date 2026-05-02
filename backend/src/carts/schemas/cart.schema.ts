
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '@/users/schemas/user.schema';
import { Product } from '@/products/schemas/product.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: false })
class CartItem {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
    product: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, min: 1, type: Number })
    quantity: number;
}

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, unique: true })
    user: mongoose.Schema.Types.ObjectId;

    @Prop({ type: [CartItem], default: [] })
    items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
