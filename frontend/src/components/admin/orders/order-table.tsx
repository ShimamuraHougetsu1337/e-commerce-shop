'use client'
import { OrderListResponse, OrderTableRow } from '@/types/admin';
import { fetchOrdersList, updateOrderStatus } from '@/utils/admin.api';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  HomeOutlined,
  PrinterOutlined,
  RocketOutlined,
  RollbackOutlined,
  SafetyCertificateOutlined,
  SyncOutlined
} from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';

const { Title, Text } = Typography;

interface OrderTableProps {
    initialData: IBackendRes<OrderListResponse>;
}

export default function OrderTable({ initialData }: OrderTableProps) {
    const t = useTranslations('AdminOrders');
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderTableRow | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<OrderTableRow | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [updateNote, setUpdateNote] = useState<string>('');
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState<string>('-createdAt');

    const [pagination, setPagination] = useState({
        current: initialData.data?.meta?.current || 1,
        pageSize: initialData.data?.meta?.pageSize || 10,
    });

    const { data: ordersRes, mutate, isLoading: swrLoading } = useSWR(
        session?.accessToken ? ['orders', pagination.current, pagination.pageSize, searchText, sort] : null,
        () => fetchOrdersList({
            current: pagination.current,
            pageSize: pagination.pageSize,
            query: searchText,
            sort: sort,
            accessToken: session?.accessToken
        }),
        {
            fallbackData: initialData,
            keepPreviousData: true,
        }
    );

    const dataSource = ordersRes?.data?.result || [];
    const total = ordersRes?.data?.meta?.total || 0;

    const handleTableChange = (pagination: TablePaginationConfig, filters: any, sorter: any) => {
        if (pagination.current && pagination.pageSize) {
            setPagination({
                current: pagination.current,
                pageSize: pagination.pageSize
            });
        }
        if (sorter.order) {
            setSort(sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`);
        } else {
            setSort('-createdAt');
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleUpdateStatus = async () => {
        if (!session?.accessToken || !editingOrder) return;
        setLoading(true);
        try {
            const res = await updateOrderStatus(editingOrder._id, newStatus, session.accessToken, updateNote);
            if (res.data) {
                message.success(t('updateSuccess'));
                setIsEditOpen(false);
                setUpdateNote(''); // Reset note
                mutate();
            } else {
                message.error(res.message || t('updateError'));
            }
        } catch (error) {
            message.error(t('serverError'));
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
        const tagStyle = { padding: '2px 10px', borderRadius: '4px' };
        switch (status) {
            case 'Pending':
            case 'Awaiting Confirmation':
                return <Tag icon={<ClockCircleOutlined />} color="default" style={tagStyle}>{t('statusPending')}</Tag>;
            case 'Confirmed':
                return <Tag icon={<SafetyCertificateOutlined />} color="cyan" style={tagStyle}>{t('statusConfirmed')}</Tag>;
            case 'Preparing':
                return <Tag icon={<SyncOutlined spin />} color="processing" style={tagStyle}>{t('statusPreparing')}</Tag>;
            case 'Shipping':
                return <Tag icon={<RocketOutlined />} color="warning" style={tagStyle}>{t('statusShipping')}</Tag>;
            case 'Delivered':
                return <Tag icon={<HomeOutlined />} color="blue" style={tagStyle}>{t('statusDelivered')}</Tag>;
            case 'Completed':
                return <Tag icon={<CheckCircleOutlined />} color="success" style={tagStyle}>{t('statusCompleted')}</Tag>;
            case 'Cancelled':
                return <Tag icon={<CloseCircleOutlined />} color="error" style={tagStyle}>{t('statusCancelled')}</Tag>;
            case 'Returned':
                return <Tag icon={<RollbackOutlined />} color="magenta" style={tagStyle}>{t('statusReturned')}</Tag>;
            default:
                return <Tag style={tagStyle}>{status}</Tag>;
        }
    };

    const columns: ColumnsType<OrderTableRow> = [
        {
            title: t('orderId'),
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
            title: t('customer'),
            key: 'customer',
            align: "center",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.userId?.name || t('guest')}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record?.userId?.email || 'N/A'}</Text>
                </Space>
            ),
        },
        {
            title: t('totalAmount'),
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'center',
            render: (total) => <Text strong color="#cf1322">{total?.toLocaleString('vi-VN')} đ</Text>,
            sorter: true,
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: t('orderDate'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: t('action'),
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('viewDetail')}>
                        <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(record)} />
                    </Tooltip>
                    <Tooltip title={t('editStatus')}>
                        <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => showEditStatus(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>{t('manageOrders')}</h2>
                <Space>
                    <Input.Search
                        placeholder={t('searchPlaceholder')}
                        onSearch={handleSearch}
                        allowClear
                    />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="_id"
                loading={loading || swrLoading}
                pagination={{
                    ...pagination,
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} đơn hàng`
                }}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={`${t('orderDetailTitle')}${selectedOrder?._id || ''}`}
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailOpen(false)}>{t('close')}</Button>,
                    <Button key="print" type="primary" icon={<PrinterOutlined />}>{t('printOrder')}</Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div style={{ marginTop: 20 }}>
                        <Descriptions title={t('customerInfo')} bordered column={2}>
                            <Descriptions.Item label={t('customerName')}>{selectedOrder.userId?.name}</Descriptions.Item>
                            <Descriptions.Item label={t('email')} span={2}>{selectedOrder.userId?.email}</Descriptions.Item>
                            <Descriptions.Item label={t('shippingAddress')} span={2}>{selectedOrder.shippingAddress}</Descriptions.Item>
                            <Descriptions.Item label={t('paymentMethod')}>{selectedOrder.paymentMethod}</Descriptions.Item>
                            <Descriptions.Item label={t('status')}>{getStatusTag(selectedOrder.status)}</Descriptions.Item>
                            {(selectedOrder as any).couponCode && (
                                <Descriptions.Item label={t('couponCode')}>
                                    <Space direction="vertical" size={0}>
                                        <Tag color="gold" style={{ margin: 0 }}>{(selectedOrder as any).couponCode.toUpperCase()}</Tag>
                                        {(selectedOrder as any).discountType && (
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {t('discount')} {(selectedOrder as any).discountType === 'PERCENTAGE' ? `${(selectedOrder as any).discountValue}%` : `${(selectedOrder as any).discountValue?.toLocaleString('vi-VN')} đ`} 
                                                <br/>({t('minOrder')} {(selectedOrder as any).minOrderValue?.toLocaleString('vi-VN')} đ)
                                            </Text>
                                        )}
                                    </Space>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider orientation="left">{t('productList')}</Divider>
                        <Table
                            dataSource={selectedOrder.items}
                            pagination={false}
                            rowKey={(record) => record.product}
                            columns={[
                                { title: t('product'), dataIndex: 'productName', key: 'name' },
                                { title: t('quantity'), dataIndex: 'quantity', key: 'quantity' },
                                {
                                    title: t('unitPrice'),
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (p) => `${p?.toLocaleString('vi-VN')} đ`
                                },
                                {
                                    title: t('subtotal'),
                                    key: 'total',
                                    render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')} đ`
                                },
                            ]}
                        />
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Title level={4}>{t('total')} <Text type="danger">{selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</Text></Title>
                        </div>

                        {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                            <>
                                <Divider orientation="left"><HistoryOutlined /> {t('orderTimeline')}</Divider>
                                <Table
                                    dataSource={selectedOrder.timeline}
                                    pagination={false}
                                    size="small"
                                    rowKey={(record) => record.timestamp + record.status}
                                    columns={[
                                        { 
                                            title: t('timelineTime'), 
                                            dataIndex: 'timestamp', 
                                            key: 'time',
                                            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
                                        },
                                        { 
                                            title: t('timelineStatus'), 
                                            dataIndex: 'status', 
                                            key: 'status',
                                            render: (status) => getStatusTag(status)
                                        },
                                        { 
                                            title: t('timelineActionBy'), 
                                            dataIndex: ['actionBy', 'name'], 
                                            key: 'by',
                                            render: (name) => name || t('system')
                                        },
                                        { 
                                            title: t('timelineNote'), 
                                            dataIndex: 'note', 
                                            key: 'note' 
                                        },
                                    ]}
                                />
                            </>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title={t('updateOrderStatus')}
                open={isEditOpen}
                onOk={handleUpdateStatus}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={loading}
                okText={t('update')}
                cancelText={t('cancel')}
            >
                <div style={{ marginTop: 20 }}>
                    <Text type="secondary" style={{ marginBottom: 10, display: 'block' }}>
                        {t('editingOrder')} <Text strong>#{editingOrder?._id?.slice(-8).toUpperCase()}</Text>
                    </Text>
                    <Select
                        value={newStatus}
                        onChange={(val) => setNewStatus(val)}
                        style={{ width: '100%', marginBottom: 16 }}
                        options={[
                            { value: 'Awaiting Confirmation', label: t('statusAwaitingConfirmation') },
                            { value: 'Confirmed', label: t('statusConfirmed') },
                            { value: 'Preparing', label: t('statusPreparing') },
                            { value: 'Shipping', label: t('statusShipping') },
                            { value: 'Delivered', label: t('statusDelivered') },
                            { value: 'Completed', label: t('statusCompleted') },
                            { value: 'Cancelled', label: t('statusCancelled') },
                            { value: 'Returned', label: t('statusReturned') },
                        ]}
                    />
                    <Text type="secondary" style={{ marginBottom: 5, display: 'block' }}>
                        {t('updateNote')}
                    </Text>
                    <Input.TextArea
                        rows={3}
                        value={updateNote}
                        onChange={(e) => setUpdateNote(e.target.value)}
                        placeholder={t('notePlaceholder')}
                    />
                </div>
            </Modal>
        </div>
    );
}


