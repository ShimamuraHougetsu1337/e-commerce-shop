'use client';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { HeartFilled, HeartOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, message } from 'antd';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const { Text } = Typography;

interface ProductActionsProps {
    product: IProduct;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const { data: session } = useSession();
    const { items, addItem, removeItem } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const isLiked = items.some(item => item._id === product._id);

    const handleAddToCart = async () => {
        if (!session?.accessToken) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            return;
        }

        setIsCartLoading(true);
        try {
            await addToCart(product, quantity, session.accessToken);
            message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        } catch (error) {
            message.error('Có lỗi xảy ra khi thêm vào giỏ hàng!');
        } finally {
            setIsCartLoading(false);
        }
    };

    const handleWishlistClick = async () => {
        if (!session?.accessToken) {
            message.warning('Vui lòng đăng nhập để thêm vào yêu thích!');
            return;
        }

        try {
            setIsWishlistLoading(true);
            if (isLiked) {
                await removeItem(product._id, session.accessToken);
                message.success('Đã gỡ khỏi danh sách yêu thích!');
            } else {
                await addItem(product, session.accessToken);
                message.success('Đã thêm vào danh sách yêu thích!');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <Flex gap="middle" align="center" wrap="wrap" style={{ marginBottom: '24px' }}>
            <Flex
                align="center"
                style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    height: '48px',
                    flexShrink: 0,
                }}
            >
                <Button
                    type="text"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ height: '100%' }}
                >
                    −
                </Button>
                <Text style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                    {quantity}
                </Text>
                <Button
                    type="text"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ height: '100%' }}
                >
                    +
                </Button>
            </Flex>

            <Button
                type="primary"
                size="large"
                style={{ height: '48px', flex: '1', backgroundColor: '#2f54eb' }}
            >
                Mua ngay
            </Button>

            <Button
                size="large"
                icon={<ShoppingOutlined />}
                style={{ height: '48px', flex: '1' }}
                onClick={handleAddToCart}
                loading={isCartLoading}
            >
                Thêm vào giỏ hàng
            </Button>

            <Button
                size="large"
                icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                style={{ height: '48px' }}
                onClick={handleWishlistClick}
                loading={isWishlistLoading}
            />
        </Flex>
    );
}
