"use client";

import { useCartStore } from '@/store/useCartStore';
import { applyCouponApi, getActiveCouponsApi } from '@/utils/cart.api';
import { createOrderApi } from '@/utils/user.api';
import { ArrowLeftOutlined, CreditCardOutlined, DeleteOutlined, GiftOutlined, HomeOutlined, ShoppingCartOutlined, TagOutlined } from '@ant-design/icons';
import { App, Breadcrumb, Button, Card, Col, Divider, Empty, Flex, Input, InputNumber, Layout, List, Modal, Result, Row, Space, Spin, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function CartPage() {
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
        message.info(`Đã xóa ${name} khỏi giỏ hàng`);
        if (appliedCoupon) setAppliedCoupon(null);
    };

    const handleApplyCoupon = async () => {
        if (!session?.accessToken) {
            message.warning('Vui lòng đăng nhập để áp dụng mã giảm giá!');
            router.push('/auth/login');
            return;
        }
        if (!couponCode) return;
        setApplyingCoupon(true);
        try {
            const res = await applyCouponApi(couponCode, getTotalPrice(), session.accessToken);
            if (res && res.data) {
                setAppliedCoupon(res.data);
                message.success('Áp dụng mã giảm giá thành công!');
            } else {
                message.error(res?.message || 'Mã giảm giá không hợp lệ');
            }
        } catch (error: any) {
            message.error(error.message || 'Mã giảm giá không hợp lệ');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        if (!session?.accessToken) {
            message.warning('Vui lòng đăng nhập để thanh toán!');
            router.push('/login');
            return;
        }

        if (items.length === 0) {
            message.warning('Giỏ hàng của bạn đang trống!');
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
                couponCode: appliedCoupon ? appliedCoupon.coupon.code : undefined,
                discountValue: appliedCoupon ? appliedCoupon.coupon.discountValue : undefined,
                discountType: appliedCoupon ? appliedCoupon.coupon.discountType : undefined,
                minOrderValue: appliedCoupon ? appliedCoupon.coupon.minOrderValue : undefined,
            };

            const res = await createOrderApi(orderPayload, session.accessToken);

            if (!res || res.statusCode !== 201) {
                message.error('Tạo đơn hàng thất bại. Vui lòng thử lại!');
                return;
            }

            // Xóa giỏ hàng sau khi thanh toán thành công
            await clearCart(session.accessToken);
            
            // Hiển thị Modal thông báo thành công
            modal.success({
                title: 'Thanh toán thành công!',
                content: (
                    <div>
                        <p>Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
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
                    router.push('/');
                }
            });

        } catch (err) {
            console.error('Checkout error:', err);
            message.error('Lỗi hệ thống, vui lòng thử lại sau.');
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
                    title="Bạn chưa đăng nhập"
                    subTitle="Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn."
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/login')}>
                            Đăng nhập ngay
                        </Button>
                    }
                />
            </Flex>
        );
    }

    if (isLoading || (status === 'authenticated' && !fetchInitiated.current)) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Spin size="large" tip="Đang tải giỏ hàng..." />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Result
                    status="error"
                    title="Không thể tải giỏ hàng"
                    subTitle={error}
                    extra={
                        <Button type="primary" onClick={() => session?.accessToken && fetchCart(session.accessToken)}>
                            Thử lại
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
                    title="Thanh toán thành công!"
                    subTitle="Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý."
                    extra={[
                        <Link href="/" key="home">
                            <Button type="primary" size="large">Tiếp tục mua sắm</Button>
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
                    description={<Text type="secondary" style={{ fontSize: 16 }}>Giỏ hàng của bạn đang trống</Text>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Link href={'/'}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        style={{ marginTop: 16 }}
                    >
                        Tiếp tục mua sắm
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
                            title: "Giỏ hàng",
                        },
                    ]}
                />

                <Title level={2} style={{ marginBottom: 24, marginTop: 12 }}>
                    <ShoppingCartOutlined /> Giỏ hàng của bạn ({items.length})
                </Title>

                <Row gutter={[32, 24]}>
                    <Col xs={24} lg={16}>
                        <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                            {items.map((item, index) => (
                                <div key={item._id}>
                                    <Row style={{ padding: '20px' }} align="middle">
                                        <Col xs={6} sm={4}>
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                                                <img
                                                    src={item.images?.[0] ?? '/placeholder.png'}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        </Col>
                                        <Col xs={18} sm={10} style={{ paddingLeft: '16px' }}>
                                            <Link href={`/products/${item._id}`}>
                                                <Text strong style={{ fontSize: 16, display: 'block' }}>{item.name}</Text>
                                            </Link>
                                            <Text type="secondary" style={{ fontSize: 13 }}>Còn lại: {item.stock_quantity}</Text>
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
                            title={<Title level={4} style={{ margin: 0 }}>Tổng cộng</Title>}
                            style={{ borderRadius: 12, position: 'sticky', top: 100 }}
                        >
                            <Flex justify="space-between" style={{ marginBottom: 12 }}>
                                <Text type="secondary">Tạm tính:</Text>
                                <Text>{getTotalPrice().toLocaleString('vi-VN')} đ</Text>
                            </Flex>
                            <Flex justify="space-between" style={{ marginBottom: 12 }}>
                                <Text type="secondary">Phí vận chuyển:</Text>
                                <Text>Miễn phí</Text>
                            </Flex>

                            <div style={{ marginBottom: 16 }}>
                                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                                    <Text strong>Mã giảm giá</Text>
                                    <Button type="link" icon={<GiftOutlined />} onClick={() => setIsCouponsModalVisible(true)} style={{ padding: 0 }}>
                                        Xem mã khả dụng
                                    </Button>
                                </Flex>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input 
                                        placeholder="Nhập mã giảm giá" 
                                        prefix={<TagOutlined />} 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!appliedCoupon}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {appliedCoupon ? (
                                        <Button danger onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                                            Hủy
                                        </Button>
                                    ) : (
                                        <Button type="primary" onClick={handleApplyCoupon} loading={applyingCoupon}>
                                            Áp dụng
                                        </Button>
                                    )}
                                </Space.Compact>
                            </div>

                            {appliedCoupon && (
                                <Flex justify="space-between" style={{ marginBottom: 12 }}>
                                    <Text type="success">Mã giảm giá ({appliedCoupon.coupon.code}):</Text>
                                    <Text type="success">-{appliedCoupon.discountAmount.toLocaleString('vi-VN')} đ</Text>
                                </Flex>
                            )}

                            <Divider />
                            <Flex justify="space-between" style={{ marginBottom: 24 }}>
                                <Text strong style={{ fontSize: 18 }}>Thành tiền:</Text>
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
                                Thanh toán ngay
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title={<span><GiftOutlined /> Mã giảm giá dành cho bạn</span>}
                open={isCouponsModalVisible}
                onCancel={() => setIsCouponsModalVisible(false)}
                footer={null}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
                {activeCoupons.length === 0 ? (
                    <Empty description="Hiện tại không có mã giảm giá nào" />
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
                                                Đã sử dụng
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
                                                Dùng ngay
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
                                                    Giảm {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString('vi-VN')}đ`}
                                                </div>
                                                <div style={{ fontSize: 12 }}>
                                                    Đơn tối thiểu: {coupon.minOrderValue.toLocaleString('vi-VN')}đ
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
