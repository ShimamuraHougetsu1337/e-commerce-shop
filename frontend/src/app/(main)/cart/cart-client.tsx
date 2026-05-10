"use client";

import { useCartStore } from '@/store/useCartStore';
import { ArrowLeftOutlined, HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Col, Empty, Flex, Layout, Result, Row, Space, Spin, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import CartItems from './components/cart-items';
import CartSummary from './components/cart-summary';

const { Title, Text } = Typography;
const { Content } = Layout;

interface CartClientProps {
    session: any;
    initialCoupons: ICoupon[];
}

export default function CartClient({ session, initialCoupons }: CartClientProps) {
    const t = useTranslations('CartPage');
    const { items, fetchCart, isLoading, error } = useCartStore();
    const router = useRouter();
    
    const status = session ? 'authenticated' : 'unauthenticated';
    const fetchInitiated = useRef(false);

    const [isCheckoutSuccess, setIsCheckoutSuccess] = React.useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.accessToken && !fetchInitiated.current) {
            fetchInitiated.current = true;
            fetchCart(session.accessToken);
        }
    }, [status, session?.accessToken, fetchCart]);

    if (status === 'unauthenticated') {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Result
                    status="403"
                    title={t('unauthenticatedTitle')}
                    subTitle={t('unauthenticatedDesc')}
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/login')}>
                            {t('loginNow')}
                        </Button>
                    }
                />
            </Flex>
        );
    }

    if (isLoading || (status === 'authenticated' && !fetchInitiated.current)) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Spin size="large" tip={t('loading')} />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex align="center" justify="center" style={{ flex: 1, minHeight: '60vh' }}>
                <Result
                    status="error"
                    title={t('loadError')}
                    subTitle={error}
                    extra={
                        <Button type="primary" onClick={() => session?.accessToken && fetchCart(session.accessToken)}>
                            {t('retry')}
                        </Button>
                    }
                />
            </Flex>
        );
    }

    if (isCheckoutSuccess) {
        return (
            <Flex vertical align="center" justify="center" style={{ flex: 1, minHeight: '60vh', padding: '24px' }}>
                <Result
                    status="success"
                    title={t('checkoutSuccessTitle')}
                    subTitle={t('checkoutSuccessDesc')}
                    extra={[
                        <Link href="/" key="home">
                            <Button type="primary" size="large">{t('continueShopping')}</Button>
                        </Link>
                    ]}
                />
            </Flex>
        );
    }

    if (items.length === 0) {
        return (
            <Flex vertical align="center" justify="center" style={{ flex: 1, minHeight: '60vh', padding: '24px' }}>
                <Empty
                    description={<Text type="secondary" style={{ fontSize: 16 }}>{t('emptyCart')}</Text>}
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
                            title: t('title'),
                        },
                    ]}
                />

                <Title level={2} style={{ marginBottom: 24, marginTop: 12 }}>
                    <ShoppingCartOutlined /> {t('yourCart')} ({items.length})
                </Title>

                <Row gutter={[32, 24]}>
                    <Col xs={24} lg={16}>
                        <CartItems session={session} />
                    </Col>
                    <Col xs={24} lg={8}>
                        <CartSummary 
                            session={session} 
                            initialCoupons={initialCoupons} 
                            onCheckoutSuccess={() => setIsCheckoutSuccess(true)} 
                        />
                    </Col>
                </Row>
            </div>
        </Content>
    );
}
