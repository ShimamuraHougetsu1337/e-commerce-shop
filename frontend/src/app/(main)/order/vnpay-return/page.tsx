"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Result, Button, Card, Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { verifyVnpayPaymentApi } from '@/utils/user.api';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

function VnpayReturnContent() {
    const t = useTranslations('VnpayReturn');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'verify_failed'>('loading');
    const [orderInfo, setOrderInfo] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const verifyPayment = async () => {
            const queryString = searchParams.toString();
            if (!queryString) {
                setStatus('verify_failed');
                setErrorMessage(t('noDetails'));
                setLoading(false);
                return;
            }

            try {
                const res = await verifyVnpayPaymentApi(queryString);
                if (res && res.statusCode === 200 && res.data?.success) {
                    setStatus('success');
                    setOrderInfo(res.data.order);
                } else {
                    setStatus('error');
                    setErrorMessage(res?.data?.message || res?.message || t('descFail'));
                }
            } catch (error: any) {
                setStatus('verify_failed');
                setErrorMessage(error?.message || t('descFail'));
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams, t]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <Title level={4} style={{ marginTop: 24 }}>{t('verifying')}</Title>
                <Text type="secondary">{t('pleaseWait')}</Text>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <Result
                status="success"
                title={t('titleSuccess')}
                subTitle={
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{t('descSuccess')}</Text>
                        {orderInfo && (
                            <Card size="small" style={{ maxWidth: 400, margin: '16px auto', textAlign: 'left', borderRadius: 8 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary">{t('orderId')}: </Text>
                                    <Text strong>{orderInfo._id || orderInfo.id}</Text>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary">{t('totalAmount')}: </Text>
                                    <Text strong style={{ color: '#f5222d' }}>
                                        {Number(orderInfo.totalAmount || 0).toLocaleString('vi-VN')} đ
                                    </Text>
                                </div>
                                <div>
                                    <Text type="secondary">{t('paymentMethod')}: </Text>
                                    <Text strong>VNPAY</Text>
                                </div>
                            </Card>
                        )}
                    </Space>
                }
                extra={[
                    <Button type="primary" key="orders" onClick={() => router.push('/profile?tab=orders')}>
                        {t('viewOrder')}
                    </Button>,
                    <Button key="home" onClick={() => router.push('/')}>
                        {t('continueShopping')}
                    </Button>,
                ]}
            />
        );
    }

    return (
        <Result
            status="error"
            title={t('titleFail')}
            subTitle={errorMessage || t('descFail')}
            extra={[
                <Button type="primary" key="cart" onClick={() => router.push('/cart')}>
                    {t('backToCart')}
                </Button>,
                <Button key="home" onClick={() => router.push('/')}>
                    {t('backToHome')}
                </Button>,
            ]}
        />
    );
}

export default function VnpayReturnPage() {
    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ width: '100%', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Suspense fallback={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                        <Spin size="large" />
                    </div>
                }>
                    <VnpayReturnContent />
                </Suspense>
            </Card>
        </div>
    );
}
