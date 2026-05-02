"use client";

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Modal, Descriptions, Divider, Tooltip } from 'antd';
import { EyeOutlined, RightOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { fetchAdminStats } from '@/utils/admin.api';

const { Title, Text } = Typography;

const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
        'PENDING': { color: 'warning', text: 'Chờ xử lý' },
        'CONFIRMED': { color: 'processing', text: 'Đã xác nhận' },
        'SHIPPING': { color: 'cyan', text: 'Đang giao' },
        'COMPLETED': { color: 'success', text: 'Hoàn thành' },
        'CANCELLED': { color: 'error', text: 'Đã hủy' }
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color} bordered={false} style={{ borderRadius: 4, fontWeight: 500 }}>{text}</Tag>;
};

export default function RecentOrders() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        const getRecentOrders = async () => {
            if (session?.accessToken) {
                try {
                    const res = await fetchAdminStats(session.accessToken);
                    if (res.data?.recentOrders) {
                        setOrders(res.data.recentOrders);
                    }
                } catch (error) {
                    console.error("Failed to fetch recent orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        getRecentOrders();
    }, [session]);

    const showDetail = (order: any) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: 'id',
            render: (id: string) => (
                <Tooltip title="Click để sao chép">
                    <Text copyable={{ text: id }} strong style={{ color: '#1f2937', fontFamily: 'monospace' }}>
                        {id.substring(0, 8).toUpperCase()}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: '#1f2937' }}>{record.userId?.name || 'Khách vãng lai'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.userId?.email || ''}</Text>
                </Space>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right' as const,
            render: (total: number) => <Text strong style={{ color: '#cf1322' }}>{total?.toLocaleString('vi-VN')} đ</Text>,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Trạng thái</div>,
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: <div style={{ textAlign: 'center' }}>Thao tác</div>,
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<EyeOutlined />}
                        onClick={() => showDetail(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <Card
                title={<Title level={4} style={{ margin: 0, fontSize: 18 }}>Đơn hàng gần đây</Title>}
                extra={
                    <Link href="/admin/orders">
                        <Button type="link" icon={<RightOutlined />} iconPosition="end" style={{ padding: 0 }}>
                            Xem tất cả
                        </Button>
                    </Link>
                }
                bordered={false}
                hoverable
                style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
                styles={{ body: { padding: '0 24px 24px 24px' } }}
            >
                <Table
                    columns={columns}
                    dataSource={orders}
                    pagination={false}
                    loading={loading}
                    rowKey="_id"
                    size="middle"
                    scroll={{ x: 800 }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>Chi tiết đơn hàng</Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>#{selectedOrder?._id?.toUpperCase()}</Text>
                    </Space>
                }
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailOpen(false)}>Đóng</Button>,
                    <Button key="print" type="primary" icon={<PrinterOutlined />}>In hóa đơn</Button>
                ]}
                width={800}
                centered
            >
                {selectedOrder && (
                    <div style={{ marginTop: 24 }}>
                        <Descriptions title="Thông tin giao hàng" bordered column={2} size="middle">
                            <Descriptions.Item label="Khách hàng">{selectedOrder.userId?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedOrder.userId?.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email" span={2}>{selectedOrder.userId?.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{selectedOrder.shippingAddress || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">{selectedOrder.paymentMethod || 'COD'}</Descriptions.Item>
                            <Descriptions.Item label="Tổng giá trị">
                                <Text strong type="danger" style={{ fontSize: 16 }}>
                                    {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ marginTop: 32 }}>Sản phẩm đã đặt</Divider>

                        <Table
                            dataSource={selectedOrder.items}
                            pagination={false}
                            rowKey="product"
                            columns={[
                                {
                                    title: 'Sản phẩm',
                                    dataIndex: 'productName',
                                    key: 'name',
                                    render: (text) => <Text strong>{text}</Text>
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    align: 'right',
                                    render: (p) => `${p?.toLocaleString('vi-VN')} đ`
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    align: 'center'
                                },
                                {
                                    title: 'Thành tiền',
                                    key: 'subtotal',
                                    align: 'right',
                                    render: (_: any, record: any) => (
                                        <Text strong>{(record.price * record.quantity).toLocaleString('vi-VN')} đ</Text>
                                    )
                                },
                            ]}
                            size="small"
                        />

                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <Space direction="vertical" align="end">
                                <Text type="secondary">Tổng tiền hàng: {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                                <Text type="secondary">Phí vận chuyển: 0 đ</Text>
                                <Title level={3} style={{ margin: '8px 0' }}>
                                    Tổng cộng: <Text type="danger">{selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                                </Title>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}