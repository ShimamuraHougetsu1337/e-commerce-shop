'use client';

import { RightOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Table, Tag, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

const Orders = () => {
    const t = useTranslations('Orders');
    const columns = [
        {
            title: t('orderId'),
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <Text strong style={{ color: '#3b82f6' }}>#{text}</Text>,
        },
        {
            title: t('orderDate'),
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let statusConfig: any = { color: 'processing', text: status };
                if (status === 'Hoàn thành' || status === t('completed')) statusConfig = { color: 'success', text: t('completed') };
                if (status === 'Đã hủy' || status === t('cancelled')) statusConfig = { color: 'error', text: t('cancelled') };
                if (status === 'Đang giao' || status === t('delivering')) statusConfig = { color: 'warning', text: t('delivering') };
                
                return <Badge status={statusConfig.color} text={statusConfig.text} />;
            },
        },
        {
            title: t('totalAmount'),
            dataIndex: 'total',
            key: 'total',
            render: (total: number) => <Text strong>{total.toLocaleString('vi-VN')} đ</Text>,
        },
        {
            title: t('payment'),
            dataIndex: 'payment',
            key: 'payment',
            render: (method: string) => <Tag bordered={false}>{method}</Tag>
        },
        {
            title: '',
            key: 'action',
            render: () => <Button type="text" icon={<RightOutlined style={{ fontSize: 12 }} />} />,
        },
    ];

    const data = [
        { key: '1', id: 'ORD-5521', date: '24/04/2026', status: 'Đang xử lý', total: 2500000, payment: 'VNPay' },
        { key: '2', id: 'ORD-5489', date: '20/04/2026', status: 'Hoàn thành', total: 1200000, payment: 'COD' },
        { key: '3', id: 'ORD-5412', date: '15/04/2026', status: 'Đã hủy', total: 500000, payment: 'Thẻ tín dụng' },
    ];

    return (
        <Card bordered={false} className="profile-card">
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>{t('orderHistory')}</Title>
                <Text type="secondary">{t('orderHistoryDesc')}</Text>
            </div>
            <Table 
                columns={columns} 
                dataSource={data} 
                pagination={{ pageSize: 5 }} 
                scroll={{ x: 800 }} 
                className="custom-table"
            />
        </Card>
    );
};

export default Orders;
