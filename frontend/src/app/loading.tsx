'use client';
import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

export default function Loading() {
    const t = useTranslations('Common');
    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}
        >
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#8c8c8c', fontWeight: 500 }}>
                {t('loadingData')}
            </div>
        </div>
    );
}