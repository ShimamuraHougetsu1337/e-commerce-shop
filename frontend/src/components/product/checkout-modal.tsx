'use client';

import { createOrderApi } from '@/utils/user.api';
import { CreditCardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { App, Button, Divider, Flex, Image, Input, Modal, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title, Text } = Typography;

interface CheckoutModalProps {
    product: IProduct;
    quantity: number;
    open: boolean;
    onCancel: () => void;
}

export default function CheckoutModal({ product, quantity, open, onCancel }: CheckoutModalProps) {
    const { message, modal } = App.useApp();
    const { data: session } = useSession();
    const router = useRouter();
    const [shippingAddress, setShippingAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = product.price * quantity;
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const handleConfirmOrder = async () => {
        if (!session?.accessToken) {
            message.warning('Vui lòng đăng nhập để thanh toán!');
            return;
        }

        if (!shippingAddress.trim()) {
            message.warning('Vui lòng nhập địa chỉ giao hàng!');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderPayload = {
                items: [
                    {
                        product: product._id,
                        productName: product.name,
                        quantity: quantity,
                        price: product.price,
                    }
                ],
                totalAmount: total,
                paymentMethod: 'COD',
                shippingAddress: shippingAddress.trim(),
            };

            const res = await createOrderApi(orderPayload, session.accessToken);

            if (res && res.statusCode === 201) {
                modal.success({
                    title: 'Đặt hàng thành công!',
                    content: (
                        <div>
                            <p>Đơn hàng của bạn đã được tiếp nhận.</p>
                            <p>Mã đơn hàng: <b>{res.data?._id || 'N/A'}</b></p>
                        </div>
                    ),
                    okText: 'Xem đơn hàng',
                    cancelText: 'Tiếp tục mua sắm',
                    okCancel: true,
                    centered: true,
                    onOk: () => {
                        router.push('/profile?tab=orders');
                    },
                    onCancel: () => {
                        setShippingAddress('');
                        onCancel();
                    }
                });
            } else {
                message.error(res?.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Order error:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}><ShoppingCartOutlined /> Xác nhận mua hàng</Title>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered
        >
            <div style={{ padding: '10px 0' }}>
                <Flex gap="middle" align="center" style={{ marginBottom: 20 }}>
                    <Image
                        src={product.images && product.images.length > 0 
                            ? (product.images[0].startsWith('http') 
                                ? product.images[0] 
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${product.images[0]}`) 
                            : "/no-image.png"}
                        alt={product.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                        preview={false}
                    />
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 16, display: 'block' }}>{product.name}</Text>
                        <Text type="secondary">Số lượng: {quantity}</Text>
                        <Text strong style={{ display: 'block', color: '#f5222d' }}>
                            {product.price.toLocaleString('vi-VN')} đ
                        </Text>
                    </div>
                </Flex>

                <Divider />

                <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Địa chỉ giao hàng</Text>
                    <Input.TextArea
                        placeholder="Nhập địa chỉ nhận hàng của bạn (Số nhà, tên đường, phường/xã...)"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                        style={{ borderRadius: 8 }}
                    />
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 12 }}>
                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                        <Text type="secondary">Tạm tính:</Text>
                        <Text>{subtotal.toLocaleString('vi-VN')} đ</Text>
                    </Flex>
                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                        <Text type="secondary">Phí vận chuyển:</Text>
                        <Text type="success">Miễn phí</Text>
                    </Flex>
                    <Divider style={{ margin: '8px 0' }} />
                    <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: 18 }}>Tổng cộng:</Text>
                        <Text strong style={{ fontSize: 22, color: '#f5222d' }}>
                            {total.toLocaleString('vi-VN')} đ
                        </Text>
                    </Flex>
                </div>

                <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CreditCardOutlined />}
                    style={{ height: 50, fontSize: 18, borderRadius: 8, marginTop: 24, backgroundColor: '#2f54eb' }}
                    onClick={handleConfirmOrder}
                    loading={isSubmitting}
                >
                    Xác nhận đặt hàng
                </Button>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12 }}>
                    Bằng cách đặt hàng, bạn đồng ý với các điều khoản của chúng tôi.
                </Text>
            </div>
        </Modal>
    );
}
