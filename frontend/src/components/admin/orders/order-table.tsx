'use client'
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Typography,
    Card,
    Breadcrumb,
    Flex,
    Tooltip,
    Modal,
    Descriptions,
    Divider,
    Select,
    message
} from 'antd';
import {
    EyeOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { OrderTableRow, OrderListResponse } from '@/types/admin';
import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { fetchOrdersList, updateOrderStatus } from '@/utils/admin.api';

const { Title, Text } = Typography;

interface OrderTableProps {
    initialData: IBackendRes<OrderListResponse>;
}

export default function OrderTable({ initialData }: OrderTableProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState(initialData.data?.result || []);
    const [selectedOrder, setSelectedOrder] = useState<OrderTableRow | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<OrderTableRow | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
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
            const res = await fetchOrdersList({
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
            message.error('Không thể tải danh sách đơn hàng');
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

    const handleUpdateStatus = async () => {
        if (!session?.accessToken || !editingOrder) return;
        setLoading(true);
        try {
            const res = await updateOrderStatus(editingOrder._id, newStatus, session.accessToken);
            if (res.data) {
                message.success('Cập nhật trạng thái đơn hàng thành công');
                setIsEditOpen(false);
                loadData(pagination.current, pagination.pageSize, searchText);
            } else {
                message.error(res.message || 'Lỗi khi cập nhật trạng thái');
            }
        } catch (error) {
            message.error('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const showDetail = (order: OrderTableRow) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const showEditStatus = (order: OrderTableRow) => {
        setEditingOrder(order);
        setNewStatus(order.status);
        setIsEditOpen(true);
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'Pending':
                return <Tag icon={<ClockCircleOutlined />} color="default" style={{ padding: '2px 10px', borderRadius: '4px' }}>Chờ xử lý</Tag>;
            case 'Processing':
                return <Tag icon={<SyncOutlined spin />} color="processing" style={{ padding: '2px 10px', borderRadius: '4px' }}>Đang xử lý</Tag>;
            case 'Completed':
                return <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '2px 10px', borderRadius: '4px' }}>Hoàn thành</Tag>;
            case 'Cancelled':
                return <Tag icon={<CloseCircleOutlined />} color="error" style={{ padding: '2px 10px', borderRadius: '4px' }}>Đã hủy</Tag>;
            default:
                return <Tag style={{ padding: '2px 10px', borderRadius: '4px' }}>{status}</Tag>;
        }
    };

    const columns: ColumnsType<OrderTableRow> = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: 'id',
            align: 'center',
            render: (id: string) => {
                if (!id) return <Text type="secondary">-</Text>;
                return (
                    <Text
                        copyable={{ text: id }}
                        strong
                        style={{ fontFamily: 'monospace' }}
                    >
                        <Tooltip title={id} placement="bottomLeft">...{id.slice(-8)}</Tooltip>
                    </Text >

                );
            }
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            align: "center",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.userId?.name || 'Guest'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record?.userId?.email || 'N/A'}</Text>
                </Space>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'center',
            render: (total) => <Text strong color="#cf1322">{total?.toLocaleString('vi-VN')} đ</Text>,
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(record)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa trạng thái">
                        <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => showEditStatus(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Flex justify="space-between" align="center">
                <Breadcrumb items={[{ title: 'Admin' }, { title: 'Orders' }]} />
            </Flex>

            <Title level={3}>Quản lý đơn hàng</Title>

            <Card styles={{ body: { padding: '24px' } }} style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                <Flex gap={16} style={{ marginBottom: 24 }} wrap="wrap">
                    <Input.Search
                        placeholder="Tìm kiếm theo mã đơn hoặc tên khách..."
                        style={{ maxWidth: 400, borderRadius: 8 }}
                        size="large"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                    />
                </Flex>

                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng số ${total} đơn hàng`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?._id || ''}`}
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailOpen(false)}>Đóng</Button>,
                    <Button key="print" type="primary" icon={<PrinterOutlined />}>In đơn hàng</Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div style={{ marginTop: 20 }}>
                        <Descriptions title="Thông tin khách hàng" bordered column={2}>
                            <Descriptions.Item label="Tên khách hàng">{selectedOrder.userId?.name}</Descriptions.Item>
                            <Descriptions.Item label="Email" span={2}>{selectedOrder.userId?.email}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>{selectedOrder.shippingAddress}</Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Danh sách sản phẩm</Divider>
                        <Table
                            dataSource={selectedOrder.items}
                            pagination={false}
                            rowKey={(record) => record.product}
                            columns={[
                                { title: 'Sản phẩm', dataIndex: 'productName', key: 'name' },
                                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (p) => `${p?.toLocaleString('vi-VN')} đ`
                                },
                                {
                                    title: 'Thành tiền',
                                    key: 'total',
                                    render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')} đ`
                                },
                            ]}
                        />
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Title level={4}>Tổng cộng: <Text type="danger">{selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</Text></Title>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title="Cập nhật trạng thái đơn hàng"
                open={isEditOpen}
                onOk={handleUpdateStatus}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={loading}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <div style={{ marginTop: 20 }}>
                    <Text type="secondary" style={{ marginBottom: 10, display: 'block' }}>
                        Đang chỉnh sửa đơn hàng: <Text strong>#{editingOrder?._id?.slice(-8).toUpperCase()}</Text>
                    </Text>
                    <Select
                        value={newStatus}
                        onChange={(val) => setNewStatus(val)}
                        style={{ width: '100%' }}
                        options={[
                            { value: 'Pending', label: 'Chờ xử lý' },
                            { value: 'Processing', label: 'Đang xử lý' },
                            { value: 'Completed', label: 'Hoàn thành' },
                            { value: 'Cancelled', label: 'Đã hủy' },
                        ]}
                    />
                </div>
            </Modal>
        </Space>
    );
}


