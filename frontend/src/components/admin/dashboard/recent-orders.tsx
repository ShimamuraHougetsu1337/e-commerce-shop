"use client";

import { fetchAdminStats } from '@/utils/admin.api';
import { EyeOutlined, PrinterOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Modal, Space, Table, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

export default function RecentOrders() {
    const t = useTranslations('AdminDashboard');
    
    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string, text: string }> = {
            'PENDING': { color: 'warning', text: t('statusPending') },
            'CONFIRMED': { color: 'processing', text: t('statusConfirmed') },
            'SHIPPING': { color: 'cyan', text: t('statusShipping') },
            'COMPLETED': { color: 'success', text: t('statusCompleted') },
            'CANCELLED': { color: 'error', text: t('statusCancelled') }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color} bordered={false} style={{ borderRadius: 4, fontWeight: 500 }}>{text}</Tag>;
    };

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
            title: t('orderId'),
            dataIndex: '_id',
            key: 'id',
            render: (id: string) => (
                <Tooltip title={t('copyTooltip')}>
                    <Text copyable={{ text: id }} strong style={{ color: '#1f2937', fontFamily: 'monospace' }}>
                        {id.substring(0, 8).toUpperCase()}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: t('customer'),
            key: 'customer',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: '#1f2937' }}>{record.userId?.name || t('guest')}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.userId?.email || ''}</Text>
                </Space>
            ),
        },
        {
            title: t('orderDate'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>,
        },
        {
            title: t('totalAmount'),
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right' as const,
            render: (total: number) => <Text strong style={{ color: '#cf1322' }}>{total?.toLocaleString('vi-VN')} đ</Text>,
        },
        {
            title: <div style={{ textAlign: 'center' }}>{t('status')}</div>,
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: <div style={{ textAlign: 'center' }}>{t('action')}</div>,
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Tooltip title={t('viewDetail')}>
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
                title={<Title level={4} style={{ margin: 0, fontSize: 18 }}>{t('recentOrders')}</Title>}
                extra={
                    <Link href="/admin/orders">
                        <Button type="link" icon={<RightOutlined />} iconPosition="end" style={{ padding: 0 }}>
                            {t('viewAll')}
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
                        <Title level={4} style={{ margin: 0 }}>{t('orderDetail')}</Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>#{selectedOrder?._id?.toUpperCase()}</Text>
                    </Space>
                }
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailOpen(false)}>{t('close')}</Button>,
                    <Button key="print" type="primary" icon={<PrinterOutlined />}>{t('printInvoice')}</Button>
                ]}
                width={800}
                centered
            >
                {selectedOrder && (
                    <div style={{ marginTop: 24 }}>
                        <Descriptions title={t('shippingInfo')} bordered column={2} size="middle">
                            <Descriptions.Item label={t('customer')}>{selectedOrder.userId?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label={t('phone')}>{selectedOrder.userId?.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label={t('email')} span={2}>{selectedOrder.userId?.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label={t('address')} span={2}>{selectedOrder.shippingAddress || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label={t('orderDate')}>{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                            <Descriptions.Item label={t('status')}>{getStatusTag(selectedOrder.status)}</Descriptions.Item>
                            <Descriptions.Item label={t('payment')}>{selectedOrder.paymentMethod || 'COD'}</Descriptions.Item>
                            <Descriptions.Item label={t('totalValue')}>
                                <Text strong type="danger" style={{ fontSize: 16 }}>
                                    {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ marginTop: 32 }}>{t('orderedProducts')}</Divider>

                        <Table
                            dataSource={selectedOrder.items}
                            pagination={false}
                            rowKey="product"
                            columns={[
                                {
                                    title: t('product'),
                                    dataIndex: 'productName',
                                    key: 'name',
                                    render: (text) => <Text strong>{text}</Text>
                                },
                                {
                                    title: t('unitPrice'),
                                    dataIndex: 'price',
                                    key: 'price',
                                    align: 'right',
                                    render: (p) => `${p?.toLocaleString('vi-VN')} đ`
                                },
                                {
                                    title: t('quantity'),
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    align: 'center'
                                },
                                {
                                    title: t('subtotal'),
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
                                <Text type="secondary">{t('totalGoods')}: {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                                <Text type="secondary">{t('shippingFee')}: {t('free')}</Text>
                                <Title level={3} style={{ margin: '8px 0' }}>
                                    {t('total')}: <Text type="danger">{selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                                </Title>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}