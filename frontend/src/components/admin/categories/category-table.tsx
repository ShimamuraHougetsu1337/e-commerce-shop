'use client'

import { CategoryListResponse, CategoryTableRow } from '@/types/admin';
import { createCategory, deleteCategory, fetchCategoriesList, updateCategory } from '@/utils/admin.api';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';

const { Title, Text } = Typography;

interface CategoryTableProps {
    initialData: IBackendRes<CategoryListResponse>;
}

export default function CategoryTable({ initialData }: CategoryTableProps) {
    const t = useTranslations('AdminCategories');
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryTableRow | null>(null);
    const [viewingCategory, setViewingCategory] = useState<CategoryTableRow | null>(null);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState<string>('-createdAt');

    const [pagination, setPagination] = useState({
        current: initialData.data?.meta?.current || 1,
        pageSize: initialData.data?.meta?.pageSize || 10,
    });

    const { data: categoriesRes, mutate, isLoading: swrLoading } = useSWR(
        session?.accessToken ? ['categories', pagination.current, pagination.pageSize, searchText, sort] : null,
        () => fetchCategoriesList({
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

    const dataSource = categoriesRes?.data?.result || [];
    const total = categoriesRes?.data?.meta?.total || 0;

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

    const showModal = (category?: CategoryTableRow) => {
        if (category) {
            setEditingCategory(category);
            form.setFieldsValue(category);
        } else {
            setEditingCategory(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await deleteCategory(id, session.accessToken);
            if (res.data) {
                message.success(t('deleteSuccess'));
                mutate();
            } else {
                message.error(res.message || t('deleteError'));
            }
        } catch (error) {
            message.error(t('serverError'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (category: CategoryTableRow) => {
        setViewingCategory(category);
        setIsDetailOpen(true);
    };

    const handleModalOk = async () => {
        if (!session?.accessToken) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            let res;
            if (editingCategory) {
                res = await updateCategory(editingCategory._id, values, session.accessToken);
            } else {
                res = await createCategory(values, session.accessToken);
            }

            if (res.data) {
                message.success(editingCategory ? t('updateSuccess') : t('addSuccess'));
                setIsModalOpen(false);
                mutate();
            } else {
                message.error(res.message || t('errorOccurred'));
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<CategoryTableRow> = [
        {
            title: t('categoryName'),
            dataIndex: 'name',
            key: 'name',
            align: "center",
            render: (name) => <Text strong style={{ color: '#1f2937' }}>{name}</Text>,
        },
        {
            title: t('slug'),
            dataIndex: 'slug',
            align: "center",
            key: 'slug',
            render: (slug) => <Tag bordered={false} color="default" style={{ borderRadius: 4 }}>{slug}</Tag>,
        },
        {
            title: t('status'),
            dataIndex: 'isActive',
            key: 'isActive',
            align: "center",
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'} bordered={false} style={{ borderRadius: 4 }}>
                    {isActive ? t('active') : t('hidden')}
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
            title: t('action'),
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('viewDetail')}>
                        <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
                    </Tooltip>
                    <Tooltip title={t('edit')}>
                        <Button type="text" shape="circle" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => showModal(record)} />
                    </Tooltip>
                    <Popconfirm
                        title={t('deleteTitle')}
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
                <h2>{t('manageCategories')}</h2>
                <Space>
                    <Input.Search
                        placeholder={t('searchPlaceholder')}
                        onSearch={handleSearch}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                        {t('addNew')}
                    </Button>
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
                    showTotal: (total) => `Tổng ${total} danh mục`
                }}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
            />
            <Modal
                title={editingCategory ? t('editCategory') : t('addCategory')}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ isActive: true }}
                    style={{ marginTop: 20 }}
                >
                    <Form.Item label={t('categoryName')} name="name" rules={[{ required: true, message: t('categoryNameRequired') }]}>
                        <Input placeholder={t('categoryNamePlaceholder')} />
                    </Form.Item>
                    <Form.Item label={t('slug')} name="slug" rules={[{ required: true, message: t('slugRequired') }]}>
                        <Input placeholder={t('slugPlaceholder')} />
                    </Form.Item>
                    <Form.Item label={t('description')} name="description">
                        <Input.TextArea rows={3} placeholder={t('descriptionPlaceholder')} />
                    </Form.Item>
                    <Form.Item label={t('status')} name="isActive" valuePropName="checked">
                        <Select options={[{ label: t('active'), value: true }, { label: t('hidden'), value: false }]} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={t('viewDetail')}
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[<Button key="close" onClick={() => setIsDetailOpen(false)}>{t('close')}</Button>]}
            >
                {viewingCategory && (
                    <div style={{ marginTop: 20 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <Text type="secondary">{t('categoryName')}:</Text>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>{viewingCategory.name}</div>
                            </div>
                            <div>
                                <Text type="secondary">{t('slug')}:</Text>
                                <div><Tag color="blue">{viewingCategory.slug}</Tag></div>
                            </div>
                            <div>
                                <Text type="secondary">{t('description')}:</Text>
                                <div>{viewingCategory.description || <i>{t('noDescription') || 'No description'}</i>}</div>
                            </div>
                            <div>
                                <Text type="secondary">{t('status')}:</Text>
                                <div>
                                    <Tag color={viewingCategory.isActive ? 'success' : 'error'}>
                                        {viewingCategory.isActive ? t('active') : t('hidden')}
                                    </Tag>
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">{t('createdAt')}:</Text>
                                <div>{dayjs(viewingCategory.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                            </div>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
}


