'use client';

import React from 'react';
import { Card, Typography, Table, Badge, Button, Tag } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Orders = () => {
    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <Text strong style={{ color: '#3b82f6' }}>#{text}</Text>,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let statusConfig: any = { color: 'processing', text: status };
                if (status === 'Hoàn thành') statusConfig = { color: 'success', text: 'Hoàn thành' };
                if (status === 'Đã hủy') statusConfig = { color: 'error', text: 'Đã hủy' };
                if (status === 'Đang giao') statusConfig = { color: 'warning', text: 'Đang giao' };
                
                return <Badge status={statusConfig.color} text={statusConfig.text} />;
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total: number) => <Text strong>{total.toLocaleString('vi-VN')} đ</Text>,
        },
        {
            title: 'Thanh toán',
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
                <Title level={4} style={{ margin: 0 }}>Lịch sử đơn hàng</Title>
                <Text type="secondary">Xem và theo dõi các đơn hàng bạn đã đặt</Text>
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
