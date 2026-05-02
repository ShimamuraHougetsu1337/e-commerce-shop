'use client';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Input, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const { Text } = Typography;

export interface Customer {
    key: string;
    name: string;
    email: string;
    group: string;
    phone: string;
    joinDate: string;
    orders: number;
    revenue: number;
    status: 'active' | 'locked';
}

interface CustomersTableProps {
    initialData: Customer[];
}

const CustomersTable = ({ initialData }: CustomersTableProps) => {
    const [dataSource, setDataSource] = useState<Customer[]>(initialData);
    const [filterText, setFilterText] = useState('');

    const filteredData = filterText
        ? dataSource.filter(
              (c) =>
                  c.name.toLowerCase().includes(filterText.toLowerCase()) ||
                  c.email.toLowerCase().includes(filterText.toLowerCase())
          )
        : dataSource;

    const handleDelete = (key: string) => {
        setDataSource((prev) => prev.filter((c) => c.key !== key));
        message.success('Đã xóa khách hàng');
    };

    const columns: ColumnsType<Customer> = [
        {
            title: 'Khách hàng',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#10b981' }}>{record.name[0]}</Avatar>
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.email}
                        </Text>
                    </Space>
                </Space>
            ),
        },
        { title: 'Nhóm', dataIndex: 'group', key: 'group' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Ngày tham gia',
            dataIndex: 'joinDate',
            key: 'joinDate',
        },
        {
            title: 'Đơn hàng',
            dataIndex: 'orders',
            key: 'orders',
            align: 'center',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (val: number) => (
                <Text strong style={{ color: '#10b981' }}>
                    {val.toLocaleString('vi-VN')}đ
                </Text>
            ),
            sorter: (a, b) => a.revenue - b.revenue,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Đã khóa', value: 'locked' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: Customer['status']) => (
                <Tag color={status === 'active' ? 'success' : 'error'} bordered={false}>
                    {status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EyeOutlined />} title="Xem chi tiết" />
                    <Button type="text" icon={<EditOutlined />} title="Chỉnh sửa" />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        title="Xóa"
                        onClick={() => handleDelete(record.key)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card
            styles={{ body: { padding: 0 } }}
            style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', borderRadius: 12 }}
        >
            <div style={{ padding: '16px 16px 0' }}>
                <Input
                    placeholder="Lọc theo tên hoặc email..."
                    prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ width: 320 }}
                    allowClear
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng cộng ${total} khách hàng`,
                    showSizeChanger: true,
                }}
                style={{ marginTop: 8 }}
            />
        </Card>
    );
};

export default CustomersTable;
