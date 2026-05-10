"use client";

import { ProductTableRow } from '@/types/admin';
import { Card, Descriptions, Drawer, Flex, Image, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface ProductDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    product: ProductTableRow | null;
}

export default function ProductDetailDrawer({ open, onClose, product }: ProductDetailDrawerProps) {
    const t = useTranslations('AdminProducts');

    const getImageUrl = (imageName: string) => {
        if (!imageName) return "/placeholder-product.png";
        if (imageName.startsWith('http')) return imageName;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${imageName}`;
    };

    return (
        <Drawer
            title={t('productDetails')}
            placement="right"
            onClose={onClose}
            open={open}
            width={450}
        >
            {product && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Flex vertical align="center">
                        <Image
                            src={getImageUrl(product.images?.[0] || "")}
                            alt={product.name}
                            width={200}
                            height={200}
                            style={{ borderRadius: 8, marginBottom: 16 }}
                            fallback="/placeholder-product.png"
                        />
                        <Title level={4}>{product.name}</Title>
                        <Tag color={product.isActive ? 'success' : 'error'} bordered={false} style={{ borderRadius: 4 }}>
                            {product.isActive ? t('onSale') : t('stopSelling')}
                        </Tag>
                    </Flex>

                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="ID">{product._id}</Descriptions.Item>
                        <Descriptions.Item label="Slug">{product.slug}</Descriptions.Item>
                        <Descriptions.Item label={t('price')}>
                            <Text strong style={{ color: '#1677ff' }}>
                                {product.price?.toLocaleString('vi-VN')} đ
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('stock')}>
                            <Text strong style={{ color: product.stock_quantity <= 10 ? '#ff4d4f' : 'inherit' }}>
                                {product.stock_quantity?.toLocaleString('vi-VN')}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('createdAt')}>
                            {dayjs(product.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('lastUpdate')}>
                            {dayjs(product.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                    </Descriptions>

                    <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>{t('shortDescription')}</Title>
                    <Card size="small" style={{ backgroundColor: '#fafafa', borderRadius: 8 }}>
                        <Text type="secondary">{product.short_description || t('noDescription')}</Text>
                    </Card>
                </Space>
            )}
        </Drawer>
    );
}
