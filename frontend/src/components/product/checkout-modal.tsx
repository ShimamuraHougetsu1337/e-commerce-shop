'use client';

import { createOrderApi } from '@/utils/user.api';
import { CreditCardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { App, Button, Divider, Flex, Input, Modal, Typography, Radio, Space } from 'antd';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface CheckoutModalProps {
    product: IProduct;
    quantity: number;
    open: boolean;
    onCancel: () => void;
}

export default function CheckoutModal({ product, quantity, open, onCancel }: CheckoutModalProps) {
    const t = useTranslations('CheckoutModal');
    const { message, modal } = App.useApp();
    const { data: session } = useSession();
    const router = useRouter();
    const [shippingAddress, setShippingAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (session?.user && open && !isInitialized) {
            setShippingAddress(session.user.address || '');
            setIsInitialized(true);
        }
    }, [session, open, isInitialized]);

    useEffect(() => {
        if (!open) {
            setIsInitialized(false);
        }
    }, [open]);

    const subtotal = product.price * quantity;
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const handleConfirmOrder = async () => {
        if (!session?.accessToken) {
            message.warning(t('loginRequired'));
            return;
        }

        if (!shippingAddress.trim()) {
            message.warning(t('addressRequired'));
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
                paymentMethod: paymentMethod,
                shippingAddress: shippingAddress.trim(),
            };

            const res = await createOrderApi(orderPayload, session.accessToken);

            if (res && (res.statusCode === 201 || res.statusCode === 200 || res.statusCode === '201' || res.statusCode === '200')) {
                const paymentUrl = res.data?.paymentUrl;
                if (paymentMethod === 'VNPAY' && paymentUrl) {
                    window.location.href = paymentUrl;
                    return;
                }

                modal.success({
                    title: t('orderSuccessTitle'),
                    content: (
                        <div>
                            <p>{t('orderSuccessDesc')}</p>
                            <p>{t('orderId')}: <b>{res.data?.order?._id || 'N/A'}</b></p>
                        </div>
                    ),
                    okText: t('viewOrder'),
                    cancelText: t('continueShopping'),
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
                message.error(res?.message || t('orderFailed'));
            }
        } catch (error) {
            console.error('Order error:', error);
            message.error(t('systemError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}><ShoppingCartOutlined /> {t('confirmOrder')}</Title>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered
        >
            <div style={{ padding: '10px 0' }}>
                <Flex gap="middle" align="center" style={{ marginBottom: 20 }}>
                    <div style={{ width: 80, height: 80, position: 'relative', flexShrink: 0 }}>
                        <Image
                            src={product.images && product.images.length > 0 
                                ? (product.images[0].startsWith('http') 
                                    ? product.images[0] 
                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${product.images[0]}`) 
                                : "/no-image.png"}
                            alt={product.name}
                            fill
                            style={{ objectFit: 'cover', borderRadius: 8 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 16, display: 'block' }}>{product.name}</Text>
                        <Text type="secondary">{t('quantity')}: {quantity}</Text>
                        <Text strong style={{ display: 'block', color: '#f5222d' }}>
                            {product.price.toLocaleString('vi-VN')} đ
                        </Text>
                    </div>
                </Flex>

                <Divider />

                <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('shippingAddress')}</Text>
                    <Input.TextArea
                        placeholder={t('addressPlaceholder')}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                        style={{ borderRadius: 8 }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('paymentMethod')}</Text>
                    <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                        <Space direction="vertical">
                            <Radio value="COD">{t('paymentCOD')}</Radio>
                            <Radio value="VNPAY">{t('paymentVNPAY')}</Radio>
                        </Space>
                    </Radio.Group>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 12 }}>
                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                        <Text type="secondary">{t('subtotal')}:</Text>
                        <Text>{subtotal.toLocaleString('vi-VN')} đ</Text>
                    </Flex>
                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                        <Text type="secondary">{t('shippingFee')}:</Text>
                        <Text type="success">{t('free')}</Text>
                    </Flex>
                    <Divider style={{ margin: '8px 0' }} />
                    <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: 18 }}>{t('total')}:</Text>
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
                    {t('confirmCheckout')}
                </Button>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12 }}>
                    {t('termsAgreement')}
                </Text>
            </div>
        </Modal>
    );
}
