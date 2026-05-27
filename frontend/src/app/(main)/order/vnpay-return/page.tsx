"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Result, Button, Card, Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { verifyVnpayPaymentApi } from '@/utils/user.api';
import { useTranslations } from 'next-intl';

import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/useCartStore';

const { Title, Text } = Typography;

function VnpayReturnContent() {
    const t = useTranslations('VnpayReturn');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { clearCart } = useCartStore();
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

    useEffect(() => {
        const handleSuccessRedirect = async () => {
            if (status === 'success' && orderInfo) {
                // Chỉ xóa giỏ hàng nếu giao dịch thành công
                if (session?.accessToken) {
                    await clearCart(session.accessToken);
                }
                const orderId = orderInfo._id || orderInfo.id || '';
                const total = orderInfo.totalAmount || '';
                router.push(`/order/success?orderId=${orderId}&method=VNPAY&total=${total}`);
            }
        };
        handleSuccessRedirect();
    }, [status, orderInfo, session, clearCart, router]);

    if (loading || status === 'success') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <Title level={4} style={{ marginTop: 24 }}>
                    {status === 'success' ? t('titleSuccess') : t('verifying')}
                </Title>
                <Text type="secondary">{t('pleaseWait')}</Text>
            </div>
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
