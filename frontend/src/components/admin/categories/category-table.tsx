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
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

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
    const [editingCategory, setEditingCategory] = useState<CategoryTableRow | null>(null);
    const [dataSource, setDataSource] = useState(initialData.data?.result || []);
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
            const res = await fetchCategoriesList({
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
                loadData(pagination.current, pagination.pageSize, searchText);
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
                        <Button type="text" shape="circle" icon={<EyeOutlined />} />
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
                loading={loading}
                pagination={pagination}
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
        </div>
    );
}


