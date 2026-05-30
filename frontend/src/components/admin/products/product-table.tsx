"use client";

import { ProductListResponse, ProductTableRow } from '@/types/admin';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Form, Image, Input, Popconfirm, Row, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import ProductDetailDrawer from './components/product-detail-drawer';
import ProductModal from './components/product-modal';
import { useProductTable } from './hooks/useProductTable';
import './product-table.css';

const { Title, Text } = Typography;

interface ProductTableProps {
    initialData: IBackendRes<ProductListResponse>;
}

export default function ProductTable({ initialData }: ProductTableProps) {
    const t = useTranslations('AdminProducts');
    const { data: session } = useSession();
    const [form] = Form.useForm();

    const {
        productsRes,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingProduct,
        setEditingProduct,
        viewingProduct,
        setViewingProduct,
        isViewDrawerOpen,
        setIsViewDrawerOpen,
        pagination,
        swrLoading,
        mutate,
        handleTableChange,
        handleSearch,
        handleDelete,
        handleModalOk
    } = useProductTable({ initialData, session, form });

    const { data: categoriesRes } = useSWR(
        session?.accessToken ? 'categories-all' : null,
        () => fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories?current=1&pageSize=100`, {
            headers: { 'Authorization': `Bearer ${session?.accessToken}` }
        }).then(res => res.json())
    );

    const categories = categoriesRes?.data?.result?.map((cat: any) => ({
        label: cat.name,
        value: cat._id
    })) || [];

    const dataSource = (productsRes?.data?.result as unknown as ProductTableRow[]) || [];
    const total = productsRes?.data?.meta?.total || 0;

    const getImageUrl = (imageName: string) => {
        if (!imageName) return "/placeholder-product.png";
        if (imageName.startsWith('http')) return imageName;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${imageName}`;
    };

    const showModal = (product?: ProductTableRow) => {
        if (product) {
            setEditingProduct(product);

            let categoryId = "";
            if (product.category) {
                categoryId = typeof product.category === 'object' ? (product.category as any)._id : product.category;
            }

            form.setFieldsValue({
                ...product,
                category_id: categoryId,
                images: product.images || [],
                isActive: product.isActive !== undefined ? product.isActive : true
            });
        } else {
            setEditingProduct(null);
            form.resetFields();
        }
        setIsModalOpen(true);
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
                        src={getImageUrl(record.images?.[0] || "")}
                        alt={record.name}
                        width={50}
                        height={50}
                        className="product-thumbnail-cell"
                        fallback="/placeholder-product.png"
                    />
                    <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'left' }}>
                        <Text strong className="product-name-text">{record.name}</Text>
                        <Text type="secondary" className="product-slug-text">{record.slug}</Text>
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
            sorter: true,
            render: (price) => <Text strong className="price-text">{price?.toLocaleString('vi-VN')} đ</Text>
        },
        {
            title: t('stock'),
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            width: 120,
            align: 'center',
            sorter: true,
            render: (stock) => (
                <Text strong className={stock <= 10 ? "stock-text-warning" : ""}>
                    {stock?.toLocaleString('vi-VN')}
                </Text>
            )
        },
        {
            title: t('category'),
            dataIndex: 'category',
            key: 'category',
            width: 150,
            align: 'center',
            render: (cat) => <Tag color="blue" bordered={false}>{cat?.name || 'N/A'}</Tag>
        },
        {
            title: t('status'),
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'} bordered={false}>
                    {isActive ? t('onSale') : t('stopSelling')}
                </Tag>
            )
        },
        {
            title: t('action'),
            key: 'action',
            width: 150,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('viewDetails')}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => { setViewingProduct(record); setIsViewDrawerOpen(true); }}
                        />
                    </Tooltip>
                    <Tooltip title={t('edit')}>
                        <Button
                            type="text"
                            style={{ color: '#faad14' }}
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title={t('confirmDelete')}
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title={t('delete')}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '0px 0px 24px 0px' }}>
            <Card className="product-table-card">
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="middle">
                    <Col xs={24} sm={12}>
                        <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
                    </Col>
                    <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                        <Space>
                            <Input.Search
                                placeholder={t('searchPlaceholder')}
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: 250 }}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                                className="add-product-btn"
                            >
                                {t('addProduct')}
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="_id"
                    loading={swrLoading || loading}
                    pagination={{
                        ...pagination,
                        total,
                        showSizeChanger: true,
                        showTotal: (total) => `${t('total')} ${total} ${t('items')}`,
                        position: ['bottomRight']
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <ProductModal
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                form={form}
                editingProduct={editingProduct}
                loading={loading}
                categories={categories}
                session={session}
            />

            <ProductDetailDrawer
                open={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                product={viewingProduct}
            />
        </div>
    );
}