"use client";

import { useCartStore } from '@/store/useCartStore';
import { applyCouponApi } from '@/utils/cart.api';
import { createOrderApi } from '@/utils/user.api';
import { CreditCardOutlined, GiftOutlined, TagOutlined } from '@ant-design/icons';
import { App, Button, Card, Divider, Flex, Input, Space, Typography, Radio } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import CouponModal from './coupon-modal';

const { Title, Text } = Typography;

interface CartSummaryProps {
    session: any;
    initialCoupons: ICoupon[];
    onCheckoutSuccess: () => void;
}

export default function CartSummary({ session, initialCoupons, onCheckoutSuccess }: CartSummaryProps) {
    const t = useTranslations('CartPage');
    const { items, getTotalPrice, clearCart, isLoading } = useCartStore();
    const { message, modal } = App.useApp();
    const router = useRouter();

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [isCouponsModalVisible, setIsCouponsModalVisible] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');

    const handleApplyCoupon = async () => {
        if (!session?.accessToken) {
            message.warning(t('loginRequiredCoupon'));
            router.push('/auth/login');
            return;
        }
        if (!couponCode) return;
        setApplyingCoupon(true);
        try {
            const res = await applyCouponApi(couponCode, getTotalPrice(), session.accessToken);
            if (res && res.data) {
                setAppliedCoupon(res.data);
                message.success(t('couponSuccess'));
            } else {
                message.error(res?.message || t('couponInvalid'));
            }
        } catch (error: any) {
            message.error(error.message || t('couponInvalid'));
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        if (!session?.accessToken) {
            message.warning(t('loginRequiredCheckout'));
            router.push('/login');
            return;
        }

        if (items.length === 0) {
            message.warning(t('emptyCartWarning'));
            return;
        }

        if (!shippingAddress.trim()) {
            message.warning(t('addressRequired'));
            return;
        }

        const outOfStockItems = items.filter(item => item.quantity > item.stock_quantity);
        if (outOfStockItems.length > 0) {
            message.error(t('outOfStockError', { productName: outOfStockItems[0].name }));
            return;
        }

        try {
            const finalTotal = appliedCoupon ? appliedCoupon.finalTotal : getTotalPrice();
            const orderPayload = {
                items: items.map(item => ({
                    product: item._id,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: finalTotal,
                paymentMethod: paymentMethod,
                shippingAddress: shippingAddress.trim(),
                couponCode: appliedCoupon ? appliedCoupon.coupon.code : undefined,
                discountValue: appliedCoupon ? appliedCoupon.coupon.discountValue : undefined,
                discountType: appliedCoupon ? appliedCoupon.coupon.discountType : undefined,
                minOrderValue: appliedCoupon ? appliedCoupon.coupon.minOrderValue : undefined,
            };

            const res = await createOrderApi(orderPayload, session.accessToken);

            if (!res || res.statusCode !== 201) {
                message.error(t('orderFailed'));
                return;
            }

            const order = res.data?.order;
            const paymentUrl = res.data?.paymentUrl;

            // VNPay: redirect luôn (không xóa giỏ hàng trước, giỏ hàng sẽ được xóa sau ở vnpay-return nếu giao dịch thành công)
            if (paymentMethod === 'VNPAY' && paymentUrl) {
                window.location.href = paymentUrl;
                return;
            }

            // COD: clear cart, trigger success, redirect to success page
            await clearCart(session.accessToken);
            onCheckoutSuccess();
            const orderId = order?._id || order?.id || 'N/A';
            const total = order?.totalAmount || finalTotal;
            router.push(`/order/success?orderId=${orderId}&method=COD&total=${total}`);

        } catch (err) {
            console.error('Checkout error:', err);
            message.error(t('systemError'));
        }
    };

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>{t('summary')}</Title>}
            style={{ borderRadius: 12, position: 'sticky', top: 100 }}
        >
            <Flex justify="space-between" style={{ marginBottom: 12 }}>
                <Text type="secondary">{t('subtotal')}:</Text>
                <Text>{getTotalPrice().toLocaleString('vi-VN')} đ</Text>
            </Flex>
            <Flex justify="space-between" style={{ marginBottom: 12 }}>
                <Text type="secondary">{t('shippingFee')}:</Text>
                <Text>{t('free')}</Text>
            </Flex>

            <div style={{ marginBottom: 16 }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                    <Text strong>{t('discountCode')}</Text>
                    <Button type="link" icon={<GiftOutlined />} onClick={() => setIsCouponsModalVisible(true)} style={{ padding: 0 }}>
                        {t('viewAvailableCodes')}
                    </Button>
                </Flex>
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder={t('enterDiscountCode')}
                        prefix={<TagOutlined />}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                        style={{ textTransform: 'uppercase' }}
                    />
                    {appliedCoupon ? (
                        <Button danger onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                            {t('cancel')}
                        </Button>
                    ) : (
                        <Button type="primary" onClick={handleApplyCoupon} loading={applyingCoupon}>
                            {t('apply')}
                        </Button>
                    )}
                </Space.Compact>
            </div>

            {appliedCoupon && (
                <Flex justify="space-between" style={{ marginBottom: 12 }}>
                    <Text type="success">{t('discountCode')} ({appliedCoupon.coupon.code}):</Text>
                    <Text type="success">-{appliedCoupon.discountAmount.toLocaleString('vi-VN')} đ</Text>
                </Flex>
            )}

            <div style={{ marginBottom: 24 }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                    <Text strong>{t('shippingAddress')}</Text>
                    {session?.user?.address && (
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, height: 'auto' }}
                            onClick={() => setShippingAddress(session.user.address)}
                        >
                            {t('useDefaultAddress')}
                        </Button>
                    )}
                </Flex>
                <Input.TextArea
                    placeholder={t('enterShippingAddress')}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    style={{ borderRadius: 8 }}
                />
            </div>

            <div style={{ marginBottom: 24 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('paymentMethod')}</Text>
                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                    <Space direction="vertical">
                        <Radio value="COD">{t('paymentCOD')}</Radio>
                        <Radio value="VNPAY">{t('paymentVNPAY')}</Radio>
                    </Space>
                </Radio.Group>
            </div>

            <Divider />
            <Flex justify="space-between" style={{ marginBottom: 24 }}>
                <Text strong style={{ fontSize: 18 }}>{t('totalAmount')}:</Text>
                <Text strong style={{ fontSize: 20, color: '#f5222d' }}>
                    {(appliedCoupon ? appliedCoupon.finalTotal : getTotalPrice()).toLocaleString('vi-VN')} đ
                </Text>
            </Flex>
            <Button
                type="primary"
                size="large"
                block
                icon={<CreditCardOutlined />}
                style={{ height: 50, fontSize: 18, borderRadius: 8 }}
                onClick={handleCheckout}
                loading={isLoading}
            >
                {t('checkoutNow')}
            </Button>

            <CouponModal
                visible={isCouponsModalVisible}
                onClose={() => setIsCouponsModalVisible(false)}
                initialCoupons={initialCoupons}
                session={session}
                totalPrice={getTotalPrice()}
                onSelectCoupon={(code) => {
                    setCouponCode(code);
                    setIsCouponsModalVisible(false);
                }}
            />
        </Card>
    );
}
