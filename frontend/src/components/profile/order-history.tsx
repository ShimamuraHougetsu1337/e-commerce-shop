'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Card, Typography, Tag, Button, Spin, Result, Flex, Divider, Modal, Badge, Rate, Form, Input, App
} from 'antd';
import {
    ReloadOutlined, ShoppingOutlined, ClockCircleOutlined,
    CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, EnvironmentOutlined, CreditCardOutlined,
    StarOutlined, MessageOutlined
} from '@ant-design/icons';
import { getMyOrdersApi, createReviewApi } from '@/utils/user.api';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface OrderItem {
    product: {
        _id: string;
        name: string;
        images: string[];
        [key: string]: any;
    };
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
    paymentMethod: string;
    shippingAddress: string;
    createdAt: string;
}

interface OrdersProps {
    accessToken: string;
}

const STATUS_CONFIG: Record<Order['status'], { color: string; label: string; icon: React.ReactNode; bg: string }> = {
    Pending: { color: '#d97706', label: 'Chờ xác nhận', icon: <ClockCircleOutlined />, bg: '#fffbeb' },
    Processing: { color: '#2563eb', label: 'Đang xử lý', icon: <SyncOutlined spin />, bg: '#eff6ff' },
    Completed: { color: '#16a34a', label: 'Hoàn thành', icon: <CheckCircleOutlined />, bg: '#f0fdf4' },
    Cancelled: { color: '#dc2626', label: 'Đã hủy', icon: <CloseCircleOutlined />, bg: '#fef2f2' },
};

const OrderCard = ({ order, accessToken }: { order: Order, accessToken: string }) => {
    const { message } = App.useApp();
    const [detailOpen, setDetailOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [form] = Form.useForm();

    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Pending;

    const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const handleOpenReview = (productId: string, productName: string) => {
        setSelectedProduct({ id: productId, name: productName });
        setReviewModalOpen(true);
    };

    const handleSubmitReview = async (values: any) => {
        if (!selectedProduct) return;
        setSubmittingReview(true);
        try {
            const res = await createReviewApi({
                productId: selectedProduct.id,
                rating: values.rating,
                comment: values.comment
            }, accessToken);

            if (res && res.statusCode === 201) {
                message.success('Cảm ơn bạn đã đánh giá sản phẩm!');
                setReviewModalOpen(false);
                form.resetFields();
            } else {
                message.error(res?.message || 'Có lỗi xảy ra khi gửi đánh giá');
            }
        } catch (error) {
            message.error('Bạn đã đánh giá sản phẩm này rồi hoặc có lỗi xảy ra');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <>
            <div className="order-card-item">
                {/* Header */}
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Flex align="center" gap={10}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, fontSize: 16 }}>
                            {cfg.icon}
                        </div>
                        <div>
                            <Text strong style={{ fontSize: 13, color: '#64748b', display: 'block', lineHeight: 1.2 }}>Mã đơn hàng</Text>
                            <Text strong style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 15 }}>
                                #{order._id}
                            </Text>
                        </div>
                    </Flex>
                    <Tag
                        style={{
                            color: cfg.color,
                            background: cfg.bg,
                            border: `1px solid ${cfg.color}30`,
                            borderRadius: 20,
                            padding: '4px 14px',
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        {cfg.label}
                    </Tag>
                </Flex>

                {/* Items preview */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
                    {order.items.slice(0, 2).map((item, idx) => (
                        <Flex key={idx} justify="space-between" align="center" style={{ padding: '8px 0', gap: 12 }}>
                            <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                                <img
                                    src={item.product.images?.[0]?.startsWith('http') 
                                        ? item.product.images[0] 
                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/products/${item.product.images?.[0]}`}
                                    alt={item.productName}
                                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', background: '#fff', border: '1px solid #f0f0f0' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text ellipsis={{ tooltip: item.productName }} style={{ display: 'block', fontSize: 14, color: '#374151' }}>
                                        {item.productName}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Số lượng: {item.quantity}
                                    </Text>
                                </div>
                            </Flex>
                            <Text strong style={{ color: '#374151', fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                            </Text>
                        </Flex>
                    ))}
                    {order.items.length > 2 && (
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                            +{order.items.length - 2} sản phẩm khác
                        </Text>
                    )}
                </div>

                {/* Footer */}
                <Flex justify="space-between" align="center">
                    <Flex gap={16}>
                        <Flex align="center" gap={5}>
                            <CreditCardOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
                            <Text type="secondary" style={{ fontSize: 13 }}>{order.paymentMethod || 'COD'}</Text>
                        </Flex>
                        <Flex align="center" gap={5}>
                            <ClockCircleOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
                            <Text type="secondary" style={{ fontSize: 13 }}>{formattedDate}</Text>
                        </Flex>
                    </Flex>
                    <Flex align="center" gap={16}>
                        <Text strong style={{ fontSize: 16, color: '#111827' }}>
                            {order.totalAmount.toLocaleString('vi-VN')} đ
                        </Text>
                        <Button size="small" onClick={() => setDetailOpen(true)} style={{ borderRadius: 8 }}>
                            Chi tiết
                        </Button>
                    </Flex>
                </Flex>
            </div>

            {/* Detail Modal */}
            <Modal
                title={
                    <Flex align="center" gap={10}>
                        <ShoppingOutlined style={{ color: '#3b82f6' }} />
                        <span>Chi tiết đơn hàng <Text style={{ color: '#3b82f6', fontFamily: 'monospace' }}>#{order._id}</Text></span>
                    </Flex>
                }
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={<Button onClick={() => setDetailOpen(false)}>Đóng</Button>}
                width={520}
            >
                <Flex align="center" gap={8} style={{ margin: '16px 0' }}>
                    <Tag style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: 20, padding: '3px 12px', fontWeight: 600 }}>
                        {cfg.icon} {cfg.label}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 13 }}>{formattedDate}</Text>
                </Flex>

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                    {order.items.map((item, idx) => (
                        <React.Fragment key={idx}>
                            <Flex justify="space-between" align="flex-start" style={{ padding: '12px 0', gap: '16px' }}>
                                <img
                                    src={item.product.images?.[0]?.startsWith('http') 
                                        ? item.product.images[0] 
                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/products/${item.product.images?.[0]}`}
                                    alt={item.productName}
                                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', background: '#fff', border: '1px solid #f0f0f0' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                        strong
                                        style={{
                                            display: 'block',
                                            fontSize: 14,
                                            wordBreak: 'break-word',
                                            lineHeight: '1.4',
                                            marginBottom: 4
                                        }}
                                    >
                                        {item.productName}
                                    </Text>
                                    <Flex align="center" justify="space-between">
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            {item.price.toLocaleString('vi-VN')} đ × {item.quantity}
                                        </Text>
                                        {order.status === 'Completed' && (
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<StarOutlined />}
                                                style={{ padding: 0, height: 'auto' }}
                                                onClick={() => handleOpenReview(item.product._id, item.productName)}
                                            >
                                                Viết đánh giá
                                            </Button>
                                        )}
                                    </Flex>
                                </div>
                                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <Text strong style={{ whiteSpace: 'nowrap' }}>
                                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                    </Text>
                                </div>
                            </Flex>
                            {idx < order.items.length - 1 && <Divider style={{ margin: '0' }} />}
                        </React.Fragment>
                    ))}
                </div>

                <Flex justify="space-between" align="center" style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 16px' }}>
                    <Text strong style={{ fontSize: 15 }}>Tổng thanh toán</Text>
                    <Text strong style={{ fontSize: 18, color: '#16a34a' }}>
                        {order.totalAmount.toLocaleString('vi-VN')} đ
                    </Text>
                </Flex>

                <Divider style={{ margin: '16px 0' }} />

                <Flex gap={8} align="flex-start">
                    <EnvironmentOutlined style={{ color: '#94a3b8', marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 13 }}>Địa chỉ giao hàng</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 13, wordBreak: 'break-word' }}>
                            {order.shippingAddress || 'Chưa có địa chỉ'}
                        </Text>
                    </div>
                </Flex>
            </Modal>

            {/* Review Modal */}
            <Modal
                title={
                    <Flex align="center" gap={10}>
                        <StarOutlined style={{ color: '#fadb14' }} />
                        <span>Đánh giá sản phẩm</span>
                    </Flex>
                }
                open={reviewModalOpen}
                onCancel={() => setReviewModalOpen(false)}
                footer={null}
                centered
            >
                <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ fontSize: 16 }}>{selectedProduct?.name}</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitReview}
                    initialValues={{ rating: 5 }}
                >
                    <Form.Item
                        name="rating"
                        label="Chất lượng sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
                    >
                        <Rate style={{ fontSize: 32 }} />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Nhận xét của bạn"
                        rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Sản phẩm có tốt không? Bạn thích điều gì nhất?"
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Flex justify="end" gap={12}>
                        <Button onClick={() => setReviewModalOpen(false)}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submittingReview}
                            icon={<MessageOutlined />}
                        >
                            Gửi đánh giá
                        </Button>
                    </Flex>
                </Form>
            </Modal>

        </>
    );
};


const OrderHistory = ({ accessToken }: OrdersProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getMyOrdersApi(accessToken);
            if (res && res.data) {
                setOrders(res.data as Order[]);
            } else {
                setError(true);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const renderBody = () => {
        if (loading) {
            return (
                <Flex justify="center" align="center" style={{ minHeight: 280 }}>
                    <Spin size="large" />
                </Flex>
            );
        }

        if (error) {
            return (
                <Result
                    status="error"
                    title="Không thể tải đơn hàng"
                    subTitle="Đã xảy ra lỗi khi lấy danh sách đơn hàng của bạn."
                    extra={<Button icon={<ReloadOutlined />} onClick={fetchOrders}>Thử lại</Button>}
                />
            );
        }

        if (orders.length === 0) {
            return (
                <Flex vertical align="center" justify="center" style={{ padding: '60px 0' }} gap={8}>
                    <ShoppingOutlined style={{ fontSize: 52, color: '#d1d5db' }} />
                    <Text type="secondary" style={{ fontSize: 15 }}>Bạn chưa có đơn hàng nào</Text>
                </Flex>
            );
        }

        return (
            <div>
                {orders.map(order => (
                    <OrderCard key={order._id} order={order} accessToken={accessToken} />
                ))}
            </div>
        );
    };

    return (
        <Card bordered={false} className="profile-card">
            <Flex justify="space-between" align="flex-start" style={{ marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>Lịch sử đơn hàng</Title>
                    <Text type="secondary">Xem và theo dõi các đơn hàng bạn đã đặt</Text>
                </div>
                {!loading && !error && (
                    <Button icon={<ReloadOutlined />} onClick={fetchOrders} size="small" type="text">
                        Làm mới
                    </Button>
                )}
            </Flex>
            {renderBody()}
        </Card>
    );
};

export default OrderHistory;
