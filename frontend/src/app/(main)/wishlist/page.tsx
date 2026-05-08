"use client";

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ArrowLeftOutlined, DeleteOutlined, HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { App, Breadcrumb, Button, Card, Col, Empty, Flex, Layout, Result, Row, Space, Spin, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function WishlistPage() {
    const t = useTranslations('WishlistPage');
    const { items, isLoading, error, fetchWishlist, removeItem } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();
    const { message } = App.useApp();
    const { data: session, status } = useSession();
    const router = useRouter();
    const fetchInitiated = useRef(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.accessToken) {
            fetchInitiated.current = true;
            fetchWishlist(session.accessToken);
        }
    }, [status, session?.accessToken, fetchWishlist]);

    const handleAddToCart = async (product: IProduct) => {
        if (!session?.accessToken) {
            message.warning(t('loginRequired'));
            return;
        }

        try {
            await addToCart(product, 1, session.accessToken);
            message.success({
                content: t('addedToCart', { productName: product.name }),
                duration: 3
            });
        } catch (error: any) {
            message.error(error.message || t('addToCartError'));
        }
    };

    const handleRemove = async (productId: string, productName: string) => {
        if (!session?.accessToken) return;
        await removeItem(productId, session.accessToken);
        message.info({
            duration: 3,
            content: t('removedFromWishlist', { productName }),
        });
    };


    if (status === 'loading') {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Spin size="large" />
            </Flex>
        );
    }


    if (status === 'unauthenticated') {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Result
                    status="403"
                    title={t('unauthenticatedTitle')}
                    subTitle={t('unauthenticatedDesc')}
                />
            </Flex>
        );
    }


    if (isLoading || (status === 'authenticated' && !fetchInitiated.current)) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Spin size="large" tip={t('loading')} />
            </Flex>
        );
    }


    if (error) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Result
                    status="error"
                    title={t('loadError')}
                    subTitle={error}
                    extra={
                        <Button type="primary" onClick={() => session?.accessToken && fetchWishlist(session.accessToken)}>
                            {t('retry')}
                        </Button>
                    }
                />
            </Flex>
        );
    }


    if (items.length === 0) {
        return (
            <Flex vertical align="center" justify="center" style={{ minHeight: '60vh', padding: '24px' }}>
                <Empty
                    description={<Text type="secondary" style={{ fontSize: 16 }}>{t('emptyWishlist')}</Text>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Link href={'/'}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        style={{ marginTop: 16 }}
                    >
                        {t('continueShopping')}
                    </Button>
                </Link>
            </Flex>
        );
    }


    return (
        <Content>
            <div className='pdp-container'>
                <Breadcrumb
                    separator=">"
                    className="pdp-breadcrumb"
                    items={[
                        {
                            title: (
                                <Link href="/">
                                    <Space size="small">
                                        <HomeOutlined />
                                        <span>Home</span>
                                    </Space>
                                </Link>
                            ),
                        },
                        {
                            title: "Wishlist",
                        },
                    ]}
                />

                <Title level={2} style={{ marginBottom: 24, marginTop: 12 }}>{t('title')} ({items.length})</Title>

                <Row gutter={[24, 24]}>
                    {items.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                            <Card
                                hoverable
                                cover={
                                    <div style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden' }}>
                                            <Image
                                                src={product.images?.[0] ?? '/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'cover', opacity: product.stock_quantity <= 0 ? 0.5 : 1 }}
                                            />
                                            {product.stock_quantity <= 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {t('outOfStock')}
                                                </div>
                                            )}
                                        </div>
                                }
                                onClick={() => { router.push(`/products/${product._id}`) }}
                                actions={[
                                    <Button
                                        key="add-cart"
                                        type="text"
                                        icon={<ShoppingCartOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        disabled={product.stock_quantity <= 0}
                                        style={{ color: product.stock_quantity > 0 ? '#1890ff' : '#d9d9d9' }}
                                    >
                                        {t('addToCart')}
                                    </Button>,
                                    <Button
                                        key="delete"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(product._id, product.name);
                                        }}
                                    >
                                        {t('remove')}
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <Text ellipsis={{ tooltip: product.name }} style={{ fontSize: 16 }}>
                                            {product.name}
                                        </Text>
                                    }
                                    description={
                                        <Text strong style={{ color: '#f5222d', fontSize: 18 }}>
                                            {product.price.toLocaleString('vi-VN')} đ
                                        </Text>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </Content>
    );
}