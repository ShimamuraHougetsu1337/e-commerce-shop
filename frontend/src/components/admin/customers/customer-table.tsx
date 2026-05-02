'use client'

import { CustomerListResponse, CustomerTableRow } from '@/types/admin';
import { deleteUser, fetchCustomersList } from '@/utils/admin.api';
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

const { Title, Text } = Typography;

interface CustomerTableProps {
    initialData: IBackendRes<CustomerListResponse>;
}

export default function CustomerTable({ initialData }: CustomerTableProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState(initialData.data?.result || []);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerTableRow | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState<string>('-createdAt');

    const [pagination, setPagination] = useState({
        current: initialData.data?.meta?.current || 1,
        pageSize: initialData.data?.meta?.pageSize || 10,
        total: initialData.data?.meta?.total || 0,
    });

    const loadData = useCallback(async (current: number, pageSize: number, query: string, sortStr?: string) => {
        setLoading(true);
        try {
            const res = await fetchCustomersList({
                current,
                pageSize,
                query,
                sort: sortStr || sort,
                accessToken: session?.accessToken
            });
            if (res.data) {
                setDataSource(res.data.result);
                setPagination({
                    current: res.data.meta.current,
                    pageSize: res.data.meta.pageSize,
                    total: res.data.meta.total,
                });
            }
        } catch (error) {
            message.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken, sort]);

    const handleTableChange = (pagination: TablePaginationConfig, filters: any, sorter: any) => {
        let sortStr = "";
        if (sorter.order) {
            sortStr = sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
        }
        setSort(sortStr);
        loadData(pagination.current || 1, pagination.pageSize || 10, searchText, sortStr);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        loadData(1, pagination.pageSize, value);
    };

    const handleDelete = async (id: string) => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await deleteUser(id, session.accessToken);
            if (res.data) {
                message.success('Xóa người dùng thành công');
                loadData(pagination.current, pagination.pageSize, searchText);
            } else {
                message.error(res.message || 'Lỗi khi xóa người dùng');
            }
        } catch (error) {
            message.error('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const showHistory = (customer: CustomerTableRow) => {
        setSelectedCustomer(customer);
        setIsHistoryOpen(true);
    };

    const columns: ColumnsType<CustomerTableRow> = [
        {
            title: <div style={{ textAlign: 'center' }}>Khách hàng</div>,
            key: 'customer',
            align: "left",
            render: (_, record) => (
                <Space size="middle">
                    <Avatar icon={<UserOutlined />} src={record.avatar} />
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ color: '#1f2937' }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            align: "center",
            render: (role) => (
                <Tag color={role === 'SUPER_ADMIN' ? 'volcano' : 'blue'} bordered={false} style={{ borderRadius: 4 }}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: "center",
            render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>,
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isDeleted',
            align: "center",
            key: 'status',
            render: (isDeleted) => (
                <Tag color={isDeleted ? 'error' : 'success'} bordered={false} style={{ borderRadius: 4 }}>
                    {isDeleted ? 'Đã khóa' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            align: "center",
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Lịch sử mua hàng">
                        <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => showHistory(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc chắn muốn xóa người dùng này không?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading }}
                        placement="topRight"
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" shape="circle" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý khách hàng</h2>
                <Space>
                    <Input.Search
                        placeholder="Tìm kiếm khách hàng..."
                        onSearch={handleSearch}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="_id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
            />

            <Modal
                title={`Lịch sử mua hàng: ${selectedCustomer?.name}`}
                open={isHistoryOpen}
                onCancel={() => setIsHistoryOpen(false)}
                footer={[<Button key="close" onClick={() => setIsHistoryOpen(false)}>Đóng</Button>]}
                width={700}
            >
                <Table
                    dataSource={[
                        { id: 'ORD001', date: '2024-04-25', amount: 1200000, status: 'Completed' },
                        { id: 'ORD005', date: '2024-03-12', amount: 450000, status: 'Completed' },
                    ]}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                    columns={[
                        { title: 'Mã đơn', dataIndex: 'id', key: 'id' },
                        { title: 'Ngày đặt', dataIndex: 'date', key: 'date', render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text> },
                        { title: 'Tổng tiền', dataIndex: 'amount', key: 'amount', render: (val) => <Text strong>{val.toLocaleString()} đ</Text> },
                        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color="success" bordered={false} style={{ borderRadius: 4 }}>{s}</Tag> },
                    ]}
                />
            </Modal>
        </div>
    );
}