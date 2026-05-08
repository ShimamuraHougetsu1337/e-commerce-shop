'use client'
import { OrderListResponse, OrderTableRow } from '@/types/admin';
import { fetchOrdersList, updateOrderStatus } from '@/utils/admin.api';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  PrinterOutlined,
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
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface OrderTableProps {
    initialData: IBackendRes<OrderListResponse>;
}

export default function OrderTable({ initialData }: OrderTableProps) {
    const t = useTranslations('AdminOrders');
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
            message.error(t('fetchError'));
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
                message.success(t('updateSuccess'));
                setIsEditOpen(false);
                loadData(pagination.current, pagination.pageSize, searchText);
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
        switch (status) {
            case 'Pending':
                return <Tag icon={<ClockCircleOutlined />} color="default" style={{ padding: '2px 10px', borderRadius: '4px' }}>{t('statusPending')}</Tag>;
            case 'Processing':
                return <Tag icon={<SyncOutlined spin />} color="processing" style={{ padding: '2px 10px', borderRadius: '4px' }}>{t('statusProcessing')}</Tag>;
            case 'Completed':
                return <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '2px 10px', borderRadius: '4px' }}>{t('statusCompleted')}</Tag>;
            case 'Cancelled':
                return <Tag icon={<CloseCircleOutlined />} color="error" style={{ padding: '2px 10px', borderRadius: '4px' }}>{t('statusCancelled')}</Tag>;
            default:
                return <Tag style={{ padding: '2px 10px', borderRadius: '4px' }}>{status}</Tag>;
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
                loading={loading}
                pagination={pagination}
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
                        style={{ width: '100%' }}
                        options={[
                            { value: 'Pending', label: t('statusPending') },
                            { value: 'Processing', label: t('statusProcessing') },
                            { value: 'Completed', label: t('statusCompleted') },
                            { value: 'Cancelled', label: t('statusCancelled') },
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
}


