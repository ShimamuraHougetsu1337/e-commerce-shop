'use client'

import { CustomerListResponse, CustomerTableRow } from '@/types/admin';
import { deleteUser, fetchCustomersList, fetchOrdersList } from '@/utils/admin.api';
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
import { useTranslations } from 'next-intl';
import { getAvatarUrl } from '@/utils/user.api';

const { Title, Text } = Typography;

interface CustomerTableProps {
    initialData: IBackendRes<CustomerListResponse>;
}

export default function CustomerTable({ initialData }: CustomerTableProps) {
    const t = useTranslations('AdminCustomers');
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState(initialData.data?.result || []);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerTableRow | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
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

    const handleDelete = async (id: string) => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await deleteUser(id, session.accessToken);
            if (res.data) {
                message.success(t('deleteSuccess'));
                loadData(pagination.current, pagination.pageSize, searchText);
            } else {
                message.error(res.message || t('deleteError'));
            }
        } catch (error) {
            message.error(t('serverError'));
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async (userId: string) => {
        if (!session?.accessToken) return;
        setHistoryLoading(true);
        try {
            const res = await fetchOrdersList({
                userId,
                pageSize: 100,
                accessToken: session.accessToken
            });
            if (res.data) {
                setHistoryData(res.data.result);
            }
        } catch (error) {
            message.error(t('fetchError'));
        } finally {
            setHistoryLoading(false);
        }
    };

    const showHistory = (customer: CustomerTableRow) => {
        setSelectedCustomer(customer);
        setIsHistoryOpen(true);
        loadHistory(customer._id);
    };

    const columns: ColumnsType<CustomerTableRow> = [
        {
            title: <div style={{ textAlign: 'center' }}>{t('customer')}</div>,
            key: 'customer',
            align: "left",
            render: (_, record) => (
                <Space size="middle">
                    <Avatar icon={<UserOutlined />} src={getAvatarUrl(record.avatar)} />
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ color: '#1f2937' }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: t('role'),
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
            title: t('createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: "center",
            render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>,
            sorter: true,
        },
        {
            title: t('status'),
            dataIndex: 'isDeleted',
            align: "center",
            key: 'status',
            render: (isDeleted) => (
                <Tag color={isDeleted ? 'error' : 'success'} bordered={false} style={{ borderRadius: 4 }}>
                    {isDeleted ? t('locked') : t('active')}
                </Tag>
            ),
        },
        {
            title: t('action'),
            key: 'action',
            fixed: 'right',
            align: "center",
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('purchaseHistory')}>
                        <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => showHistory(record)} />
                    </Tooltip>
                    <Popconfirm
                        title={t('deleteUser')}
                        description={t('deleteConfirm')}
                        onConfirm={() => handleDelete(record._id)}
                        okText={t('delete')}
                        cancelText={t('cancel')}
                        okButtonProps={{ danger: true, loading }}
                        placement="topRight"
                    >
                        <Tooltip title={t('delete')}>
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
                <h2>{t('manageCustomers')}</h2>
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
                scroll={{ x: 800 }}
            />

            <Modal
                title={`${t('historyTitle')}${selectedCustomer?.name}`}
                open={isHistoryOpen}
                onCancel={() => setIsHistoryOpen(false)}
                footer={[<Button key="close" onClick={() => setIsHistoryOpen(false)}>{t('close')}</Button>]}
                width={700}
            >
                <Table
                    dataSource={historyData}
                    loading={historyLoading}
                    pagination={{ pageSize: 5 }}
                    rowKey="_id"
                    size="middle"
                    columns={[
                        {
                            title: t('orderId'),
                            dataIndex: '_id',
                            key: 'id',
                            render: (id: string) => <Text strong style={{ fontFamily: 'monospace' }}>...{id.slice(-8).toUpperCase()}</Text>
                        },
                        {
                            title: t('orderDate'),
                            dataIndex: 'createdAt',
                            key: 'date',
                            render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
                        },
                        {
                            title: t('totalAmount'),
                            dataIndex: 'totalAmount',
                            key: 'amount',
                            render: (val) => <Text strong type="danger">{val?.toLocaleString('vi-VN')} đ</Text>
                        },
                        {
                            title: t('orderStatus'),
                            dataIndex: 'status',
                            key: 'status',
                            render: (s) => {
                                let color = 'default';
                                if (s === 'Completed' || s === 'Delivered') color = 'success';
                                if (s === 'Cancelled' || s === 'Returned') color = 'error';
                                if (s === 'Shipping' || s === 'Confirmed' || s === 'Preparing') color = 'processing';
                                return <Tag color={color} bordered={false} style={{ borderRadius: 4 }}>{s}</Tag>
                            }
                        },
                    ]}
                />
            </Modal>
        </div>
    );
}