"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Result, Button, Card, Typography, Space, Tag, Divider } from 'antd';
import {
    CheckCircleFilled,
    ShoppingOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    CarOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const orderId = searchParams.get('orderId') || '';
    const method = searchParams.get('method') || 'COD';
    const total = searchParams.get('total') || '';

    const shortId = orderId ? orderId.slice(-8).toUpperCase() : 'N/A';

    const methodLabel = method === 'VNPAY'
        ? { text: 'VNPAY', color: 'blue', icon: <CreditCardOutlined /> }
        : { text: 'Thanh toán khi nhận hàng (COD)', color: 'green', icon: <CarOutlined /> };

    return (
        <div
            style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 520,
                    borderRadius: 20,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
                    border: 'none',
                    overflow: 'hidden',
                }}
                bodyStyle={{ padding: '40px 36px' }}
            >
                {/* Icon thành công */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <CheckCircleFilled style={{ fontSize: 72, color: '#22c55e' }} />
                    <Title level={3} style={{ marginTop: 16, marginBottom: 4, color: '#15803d' }}>
                        Đặt hàng thành công!
                    </Title>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        Cảm ơn bạn đã mua sắm. Đơn hàng đang được xử lý.
                    </Text>
                </div>

                <Divider style={{ margin: '20px 0' }} />

                {/* Thông tin đơn hàng */}
                <Space direction="vertical" style={{ width: '100%' }} size={14}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary">
                            <FileTextOutlined style={{ marginRight: 6 }} />
                            Mã đơn hàng
                        </Text>
                        <Text strong copyable={{ text: orderId }} style={{ fontSize: 15, fontFamily: 'monospace', color: '#1677ff' }}>
                            #{shortId}
                        </Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary">
                            <CreditCardOutlined style={{ marginRight: 6 }} />
                            Phương thức thanh toán
                        </Text>
                        <Tag color={methodLabel.color} icon={methodLabel.icon} style={{ fontSize: 13 }}>
                            {methodLabel.text}
                        </Tag>
                    </div>

                    {total && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary">Tổng thanh toán</Text>
                            <Text strong style={{ fontSize: 18, color: '#f5222d' }}>
                                {Number(total).toLocaleString('vi-VN')}đ
                            </Text>
                        </div>
                    )}
                </Space>

                <Divider style={{ margin: '24px 0' }} />

                {/* Thông báo giao hàng */}
                <div
                    style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 10,
                        padding: '12px 16px',
                        marginBottom: 28,
                        textAlign: 'center',
                    }}
                >
                    <CarOutlined style={{ color: '#16a34a', marginRight: 8 }} />
                    <Text style={{ color: '#15803d', fontSize: 14 }}>
                        {method === 'VNPAY'
                            ? 'Thanh toán đã được xác nhận. Đơn hàng sẽ được giao trong 2-5 ngày.'
                            : 'Vui lòng thanh toán khi nhận hàng. Đơn hàng sẽ được giao trong 2-5 ngày.'}
                    </Text>
                </div>

                {/* Buttons */}
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<FileTextOutlined />}
                        style={{ height: 46, borderRadius: 10, fontWeight: 600 }}
                        onClick={() => router.push('/profile?tab=orders')}
                    >
                        Xem đơn hàng của tôi
                    </Button>
                    <Button
                        size="large"
                        block
                        icon={<ShoppingOutlined />}
                        style={{ height: 46, borderRadius: 10 }}
                        onClick={() => router.push('/')}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Space>
            </Card>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '70vh' }} />}>
            <OrderSuccessContent />
        </Suspense>
    );
}
