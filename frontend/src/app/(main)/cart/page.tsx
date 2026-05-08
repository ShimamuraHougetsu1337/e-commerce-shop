"use client";

import { useCartStore } from '@/store/useCartStore';
import { applyCouponApi, getActiveCouponsApi } from '@/utils/cart.api';
import { createOrderApi } from '@/utils/user.api';
import { ArrowLeftOutlined, CreditCardOutlined, DeleteOutlined, GiftOutlined, HomeOutlined, ShoppingCartOutlined, TagOutlined } from '@ant-design/icons';
import { App, Breadcrumb, Button, Card, Col, Divider, Empty, Flex, Input, InputNumber, Layout, List, Modal, Result, Row, Space, Spin, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function CartPage() {
    const t = useTranslations('CartPage');
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart, fetchCart, isLoading, error, hasFetched } = useCartStore();
    const { message, modal } = App.useApp();
    const router = useRouter();
    const { data: session, status } = useSession();
    const fetchInitiated = useRef(false);

    const [isCheckoutSuccess, setIsCheckoutSuccess] = React.useState(false);
    const [couponCode, setCouponCode] = React.useState('');
    const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
    const [applyingCoupon, setApplyingCoupon] = React.useState(false);
    const [isCouponsModalVisible, setIsCouponsModalVisible] = React.useState(false);
    const [activeCoupons, setActiveCoupons] = React.useState<ICoupon[]>([]);
    const [shippingAddress, setShippingAddress] = React.useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.accessToken && !fetchInitiated.current) {
            fetchInitiated.current = true;
            fetchCart(session.accessToken);
        }
    }, [status, session?.accessToken, fetchCart]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await getActiveCouponsApi();
                if (res.data) setActiveCoupons(res.data);
            } catch (err) {}
        };
        fetchCoupons();
    }, []);

    const handleRemove = async (id: string, name: string) => {
        if (!session?.accessToken) return;
        await removeItem(id, session.accessToken);
        message.info(t('removedFromCart', { productName: name }));
        if (appliedCoupon) setAppliedCoupon(null);
    };

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

        // Kiểm tra tồn kho trước khi thanh toán
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
                paymentMethod: 'COD',
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

            // Xóa giỏ hàng sau khi thanh toán thành công
            await clearCart(session.accessToken);
            
            // Hiển thị Modal thông báo thành công
            modal.success({
                title: t('checkoutSuccessTitle'),
                content: (
                    <div>
                        <p>{t('checkoutSuccessDesc')}</p>
                        <p>{t('orderId')}: <b>{res.data?._id || 'N/A'}</b></p>
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
                    router.push('/');
                }
            });

        } catch (err) {
            console.error('Checkout error:', err);
            message.error(t('systemError'));
        }
    };

    if (status === 'loading') {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Result
                    status="403"
                    title={t('unauthenticatedTitle')}
                    subTitle={t('unauthenticatedDesc')}
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/login')}>
                            {t('loginNow')}
                        </Button>
                    }
                />
            </Flex>
        );
    }

    if (isLoading || (status === 'authenticated' && !fetchInitiated.current)) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Spin size="large" tip={t('loading')} />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Result
                    status="error"
                    title={t('loadError')}
                    subTitle={error}
                    extra={
                        <Button type="primary" onClick={() => session?.accessToken && fetchCart(session.accessToken)}>
                            {t('retry')}
                        </Button>
                    }
                />
            </Flex>
        );
    }

    if (isCheckoutSuccess) {
        return (
            <Flex vertical align="center" justify="center" style={{ flex: 1, minHeight: '60vh', padding: '24px' }}>
                <Result
                    status="success"
                    title={t('checkoutSuccessTitle')}
                    subTitle={t('checkoutSuccessDesc')}
                    extra={[
                        <Link href="/" key="home">
                            <Button type="primary" size="large">{t('continueShopping')}</Button>
                        </Link>
                    ]}
                />
            </Flex>
        );
    }

    if (items.length === 0) {
        return (
            <Flex vertical align="center" justify="center" style={{ flex: 1, minHeight: '60vh', padding: '24px' }}>
                <Empty
                    description={<Text type="secondary" style={{ fontSize: 16 }}>{t('emptyCart')}</Text>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Link href={'/'}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        style={{ marginTop: 16 }}
                    >
                        {t('continueShopping')}
                    </Button>
                </Link>
            </Flex>
        );
    }

    return (
        <Content>
            <div className='pdp-container'>
                <Breadcrumb
                    separator=">"
                    className="pdp-breadcrumb"
                    items={[
                        {
                            title: (
                                <Link href="/">
                                    <Space size="small">
                                        <HomeOutlined />
                                        <span>Home</span>
                                    </Space>
                                </Link>
                            ),
                        },
                        {
                            title: t('title'),
                        },
                    ]}
                />

                <Title level={2} style={{ marginBottom: 24, marginTop: 12 }}>
                    <ShoppingCartOutlined /> {t('yourCart')} ({items.length})
                </Title>

                <Row gutter={[32, 24]}>
                    <Col xs={24} lg={16}>
                        <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                            {items.map((item, index) => (
                                <div key={item._id}>
                                    <Row style={{ padding: '20px' }} align="middle">
                                        <Col xs={6} sm={4}>
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                                                <Image
                                                    src={item.images?.[0] ?? '/placeholder.png'}
                                                    alt={item.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        </Col>
                                        <Col xs={18} sm={10} style={{ paddingLeft: '16px' }}>
                                            <Link href={`/products/${item._id}`}>
                                                <Text strong style={{ fontSize: 16, display: 'block' }}>{item.name}</Text>
                                            </Link>
                                            <Text type="secondary" style={{ fontSize: 13 }}>{t('remaining')}: {item.stock_quantity}</Text>
                                        </Col>
                                        <Col xs={12} sm={5} style={{ textAlign: 'center', marginTop: '12px' }}>
                                            <InputNumber
                                                min={1}
                                                max={item.stock_quantity}
                                                value={item.quantity}
                                                onChange={(val) => val && session?.accessToken && updateQuantity(item._id, val, session.accessToken)}
                                            />
                                        </Col>
                                        <Col xs={8} sm={4} style={{ textAlign: 'right', marginTop: '12px' }}>
                                            <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                            </Text>
                                        </Col>
                                        <Col xs={4} sm={1} style={{ textAlign: 'right', marginTop: '12px' }}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemove(item._id, item.name)}
                                            />
                                        </Col>
                                    </Row>
                                    {index < items.length - 1 && <Divider style={{ margin: 0 }} />}
                                </div>
                            ))}
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
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
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('shippingAddress')}</Text>
                                <Input.TextArea
                                    placeholder={t('enterShippingAddress')}
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    rows={3}
                                    style={{ borderRadius: 8 }}
                                />
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
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title={<span><GiftOutlined /> {t('discountForYou')}</span>}
                open={isCouponsModalVisible}
                onCancel={() => setIsCouponsModalVisible(false)}
                footer={null}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
                {activeCoupons.length === 0 ? (
                    <Empty description={t('noDiscountCodes')} />
                ) : (
                    <List
                        dataSource={activeCoupons}
                        renderItem={(coupon) => {
                            const userId = (session?.user as any)?.id || (session?.user as any)?._id;
                            const isUsed = coupon.usedBy && userId && coupon.usedBy.includes(userId);

                            return (
                                <List.Item
                                    actions={[
                                        isUsed ? (
                                            <Button key="used" size="small" disabled style={{ color: '#ff4d4f', background: '#fff1f0', border: '1px solid #ffa39e' }}>
                                                {t('used')}
                                            </Button>
                                        ) : (
                                            <Button 
                                                key="use" 
                                                type="primary" 
                                                size="small"
                                                disabled={getTotalPrice() < coupon.minOrderValue}
                                                onClick={() => {
                                                    setCouponCode(coupon.code);
                                                    setIsCouponsModalVisible(false);
                                                }}
                                            >
                                                {t('useNow')}
                                            </Button>
                                        )
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <TagOutlined style={{ color: '#1677ff' }} />
                                                <Text strong style={{ fontSize: 16, textTransform: 'uppercase' }}>{coupon.code}</Text>
                                            </Space>
                                        }
                                        description={
                                            <div>
                                                <div style={{ color: '#f5222d', fontWeight: 500, marginBottom: 4 }}>
                                                    {t('discount')} {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString('vi-VN')}đ`}
                                                </div>
                                                <div style={{ fontSize: 12 }}>
                                                    {t('minOrder')}: {coupon.minOrderValue.toLocaleString('vi-VN')}đ
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Modal>
        </Content>
    );
}
