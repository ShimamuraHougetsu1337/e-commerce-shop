"use client";

import { ProductListResponse, ProductTableRow } from '@/types/admin';
import { createProduct, deleteProduct, fetchProductsList, updateProduct } from '@/utils/admin.api';
import { DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Drawer, Flex, Form, Image, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Typography, Upload } from 'antd';
import NextImage from 'next/image';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface ProductTableProps {
    initialData: IBackendRes<ProductListResponse>;
}

export default function ProductTable({ initialData }: ProductTableProps) {
    const t = useTranslations('AdminProducts');
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductTableRow | null>(null);
    const [viewingProduct, setViewingProduct] = useState<ProductTableRow | null>(null);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [dataSource, setDataSource] = useState<ProductTableRow[]>(
        (initialData.data?.result as unknown as ProductTableRow[]) || []
    );
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState<string>('-createdAt');
    const [imageUrl, setImageUrl] = useState<string>('');

    const [pagination, setPagination] = useState({
        current: initialData.data?.meta?.current || 1,
        pageSize: initialData.data?.meta?.pageSize || 10,
        total: initialData.data?.meta?.total || 0,
    });

    const loadCategories = useCallback(async () => {
        if (!session?.accessToken) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories?current=1&pageSize=100`, {
                headers: { 'Authorization': `Bearer ${session.accessToken}` }
            });
            const data = await res.json();
            if (data.data?.result) {
                const options = data.data.result.map((cat: any) => ({
                    label: cat.name,
                    value: cat._id
                }));
                setCategories(options);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const getImageUrl = (imageName: string) => {
        if (!imageName) return "/placeholder-product.png";
        if (imageName.startsWith('http')) return imageName;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${imageName}`;
    };

    const loadData = useCallback(async (current: number, pageSize: number, query: string, sortStr?: string) => {
        setLoading(true);
        try {
            const res = await fetchProductsList({
                current,
                pageSize,
                query,
                sort: sortStr || sort,
                accessToken: session?.accessToken
            });
            if (res.data) {
                setDataSource(res.data.result as unknown as ProductTableRow[]);
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

    const showModal = (product?: ProductTableRow) => {
        if (product) {
            setEditingProduct(product);
            const thumb = recordToThumbnail(product);
            setImageUrl(thumb);

            // Map category to ID string
            let categoryId = "";
            if (product.category) {
                categoryId = typeof product.category === 'object' ? (product.category as any)._id : product.category;
            }

            form.setFieldsValue({
                ...product,
                category_id: categoryId,
                thumbnail: thumb,
                isActive: product.isActive !== undefined ? product.isActive : true
            });
        } else {
            setEditingProduct(null);
            setImageUrl('');
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const recordToThumbnail = (product: ProductTableRow) => {
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return '';
    };

    const showViewDrawer = (product: ProductTableRow) => {
        setViewingProduct(product);
        setIsViewDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await deleteProduct(id, session.accessToken);
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

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.data?.fileName) {
                setImageUrl(data.data.fileName);
                form.setFieldValue('thumbnail', data.data.fileName);
                onSuccess("Ok");
                message.success(t('uploadSuccess'));
            } else {
                onError("Error");
                // Hiển thị lỗi chi tiết từ server nếu có
                const errorMsg = data.message || (Array.isArray(data.message) ? data.message[0] : t('uploadFailed'));
                message.error(errorMsg);
            }
        } catch (error) {
            onError(error);
            message.error(t('serverError'));
        } finally {
            setUploading(false);
        }
    };

    const handleModalOk = async () => {
        if (!session?.accessToken) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            const { thumbnail, ...restValues } = values;
            const payload = {
                ...restValues,
                images: thumbnail ? [thumbnail] : []
            };

            if (editingProduct) {
                payload.id = editingProduct._id;
            }

            let res;
            if (editingProduct) {
                res = await updateProduct(editingProduct._id, payload, session.accessToken);
            } else {
                res = await createProduct(payload, session.accessToken);
            }

            if (res.data) {
                message.success(editingProduct ? t('updateSuccess') : t('addSuccess'));
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

    const columns: ColumnsType<ProductTableRow> = [
        {
            title: t('product'),
            key: 'product',
            width: 320,
            align: 'center',
            render: (_, record) => (
                <Space size="middle" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Image
                        src={getImageUrl(record.images && record.images.length > 0 ? record.images[0] : "")}
                        alt={record.name}
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                        fallback="/placeholder-product.png"
                    />
                    <Space direction="vertical" size={0} style={{ width: '100%', wordBreak: 'break-word' }}>
                        <Text strong style={{ color: '#1f2937' }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.slug}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: t('price'),
            dataIndex: 'price',
            key: 'price',
            width: 140,
            align: 'center',
            render: (price) => <Text strong style={{ color: '#1677ff' }}>{price?.toLocaleString('vi-VN')} đ</Text>,
            sorter: true,
        },
        {
            title: t('stock'),
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            align: 'center',
            width: 120,
            render: (stock) => (
                <Text strong style={{ color: stock <= 10 ? '#ff4d4f' : 'inherit', fontSize: '15px' }}>
                    {stock?.toLocaleString('vi-VN')}
                </Text>
            ),
        },
        {
            title: t('status'),
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            width: 150,
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'} bordered={false} style={{ borderRadius: 4 }}>
                    {isActive ? t('onSale') : t('stopSelling')}
                </Tag>
            ),
        },
        {
            title: t('createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            align: 'center',
            render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>,
        },
        {
            title: t('action'),
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('viewDetail')}>
                        <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => showViewDrawer(record)} />
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
                <h2>{t('manageProducts')}</h2>
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

            <Table<ProductTableRow>
                columns={columns}
                dataSource={dataSource}
                rowKey="_id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={editingProduct ? t('editProduct') : t('addProduct')}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                width={700}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ isActive: true, price: 0, stock_quantity: 0 }}
                    style={{ marginTop: 20 }}
                >
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item label={t('productName')} name="name" rules={[{ required: true, message: t('productNameRequired') }]}>
                                <Input placeholder={t('productNamePlaceholder')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Slug (URL)" name="slug" rules={[{ required: true, message: t('slugRequired') }]}>
                                <Input placeholder="iphone-15-pro-max" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label={t('category')} name="category_id" rules={[{ required: true, message: t('categoryRequired') }]}>
                                <Select
                                    placeholder={t('categoryPlaceholder')}
                                    options={categories}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label={t('priceTitle')} name="price" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={t('stockTitle')} name="stock_quantity" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={t('status')} name="isActive" rules={[{ required: true, message: t('statusRequired') }]}>
                                <Select options={[{ label: t('onSale'), value: true }, { label: t('stopSelling'), value: false }]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t('productImage')}>
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    accept=".png,.jpg,.jpeg"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    customRequest={handleUpload}
                                    beforeUpload={(file) => {
                                        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                                        if (!isJpgOrPng) {
                                            message.error(t('uploadErrorMsg'));
                                        }
                                        const isLt2M = file.size / 1024 / 1024 < 5;
                                        if (!isLt2M) {
                                            message.error(t('sizeError'));
                                        }
                                        return isJpgOrPng && isLt2M;
                                    }}
                                >
                                    {imageUrl ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <NextImage
                                                src={getImageUrl(imageUrl)}
                                                alt="avatar"
                                                fill
                                                style={{ objectFit: 'cover', borderRadius: 8 }}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>{t('uploadImage')}</div>
                                        </div>
                                    )}
                                </Upload>
                                <Form.Item name="thumbnail" noStyle>
                                    <Input type="hidden" />
                                </Form.Item>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t('orImageLink')} name="thumbnail">
                                <Input
                                    placeholder="https://example.com/image.png"
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label={t('shortDescription')} name="short_description">
                        <Input.TextArea rows={3} placeholder={t('shortDescriptionPlaceholder')} />
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title={t('productDetail')}
                placement="right"
                onClose={() => setIsViewDrawerOpen(false)}
                open={isViewDrawerOpen}
                width={600}
            >
                {viewingProduct && (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Flex justify="center" vertical align="center">
                            <Image
                                src={getImageUrl(viewingProduct.images?.[0] || "")}
                                alt={viewingProduct.name}
                                width={200}
                                style={{ borderRadius: 8, marginBottom: 16 }}
                                fallback="/placeholder-product.png"
                            />
                            <Title level={4}>{viewingProduct.name}</Title>
                            <Tag color={viewingProduct.isActive ? 'success' : 'error'} bordered={false} style={{ borderRadius: 4 }}>
                                {viewingProduct.isActive ? t('onSale') : t('stopSelling')}
                            </Tag>
                        </Flex>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="ID">{viewingProduct._id}</Descriptions.Item>
                            <Descriptions.Item label="Slug">{viewingProduct.slug}</Descriptions.Item>
                            <Descriptions.Item label={t('price')}>
                                <Text strong style={{ color: '#1677ff' }}>
                                    {viewingProduct.price?.toLocaleString('vi-VN')} đ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('stock')}>
                                <Text strong style={{ color: viewingProduct.stock_quantity <= 10 ? '#ff4d4f' : 'inherit' }}>
                                    {viewingProduct.stock_quantity?.toLocaleString('vi-VN')}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('createdAt')}>
                                {dayjs(viewingProduct.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('lastUpdate')}>
                                {dayjs(viewingProduct.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>{t('shortDescription')}</Title>
                        <Card size="small" style={{ backgroundColor: '#fafafa', borderRadius: 8 }}>
                            <Text type="secondary">{viewingProduct.short_description || t('noDescription')}</Text>
                        </Card>
                    </Space>
                )}
            </Drawer>
        </div>
    );
}