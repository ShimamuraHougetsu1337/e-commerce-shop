"use client";

import { useWishlistStore } from '@/store/useWishlistStore';
import { ArrowLeftOutlined, DeleteOutlined, HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { App, Breadcrumb, Button, Card, Col, Empty, Flex, Layout, Result, Row, Space, Spin, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function WishlistPage() {
    const { items, isLoading, error, fetchWishlist, removeItem } = useWishlistStore();
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

    const handleAddToCart = (productName: string) => {
        message.success({
            content: `Đã thêm ${productName} vào giỏ hàng!`,
            duration: 3
        });
    };

    const handleRemove = async (productId: string, productName: string) => {
        if (!session?.accessToken) return;
        await removeItem(productId, session.accessToken);
        message.info({
            duration: 3,
            content: `Đã xóa ${productName} khỏi danh sách yêu thích.`,
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
                    title="Bạn chưa đăng nhập"
                    subTitle="Vui lòng đăng nhập để xem và quản lý danh sách yêu thích của bạn."
                />
            </Flex>
        );
    }


    if (isLoading || (status === 'authenticated' && !fetchInitiated.current)) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Spin size="large" tip="Đang tải danh sách yêu thích..." />
            </Flex>
        );
    }


    if (error) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                <Result
                    status="error"
                    title="Không thể tải danh sách yêu thích"
                    subTitle={error}
                    extra={
                        <Button type="primary" onClick={() => session?.accessToken && fetchWishlist(session.accessToken)}>
                            Thử lại
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
                    description={<Text type="secondary" style={{ fontSize: 16 }}>Danh sách yêu thích của bạn đang trống</Text>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Link href={'/'}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        style={{ marginTop: 16 }}
                    >
                        Tiếp tục mua sắm
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

                <Title level={2} style={{ marginBottom: 24, marginTop: 12 }}>Danh sách yêu thích ({items.length})</Title>

                <Row gutter={[24, 24]}>
                    {items.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                            <Card
                                hoverable
                                cover={
                                    <div style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden' }}>
                                        <img
                                            src={product.images?.[0] ?? '/placeholder.png'}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
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
                                            handleAddToCart(product.name);
                                        }}
                                        style={{ color: '#1890ff' }}
                                    >
                                        Thêm giỏ hàng
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
                                        Xóa
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