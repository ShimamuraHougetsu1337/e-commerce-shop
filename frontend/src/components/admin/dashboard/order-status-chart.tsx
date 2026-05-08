"use client";

import { fetchAdminStats } from '@/utils/admin.api';
import { Pie } from '@ant-design/plots';
import { Card, Empty, Flex, Skeleton, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

export default function OrderStatusChart() {
    const t = useTranslations('AdminDashboard');
    const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
        'PENDING': { label: t('statusPending'), color: '#faad14' },
        'CONFIRMED': { label: t('statusConfirmed'), color: '#1677ff' },
        'SHIPPING': { label: t('statusShipping'), color: '#13c2c2' },
        'COMPLETED': { label: t('statusCompleted'), color: '#52c41a' },
        'CANCELLED': { label: t('statusCancelled'), color: '#ff4d4f' }
    };

    const { data: session } = useSession();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStatusData = async () => {
            if (session?.accessToken) {
                try {
                    const res = await fetchAdminStats(session.accessToken);
                    if (res.data?.statusDistribution) {
                        const formattedData = res.data.statusDistribution.map((item: any) => ({
                            type: STATUS_CONFIG[item._id]?.label || item._id,
                            value: item.count,
                            color: STATUS_CONFIG[item._id]?.color || '#d9d9d9'
                        }));
                        setData(formattedData);
                    }
                } catch (error) {
                    console.error("Failed to fetch status data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        getStatusData();
    }, [session]);

    const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

    const config = {
        data,
        angleField: 'value',
        colorField: 'type',
        color: data.map(d => d.color),
        radius: 0.85,
        innerRadius: 0.65,
        label: {
            text: 'value',
            position: 'spider',
            style: {
                fontWeight: 600,
                fill: '#595959',
            },
        },
        legend: {
            color: {
                title: false,
                position: 'bottom',
                rowPadding: 5,
            },
        },
        tooltip: {
            title: 'type',
            items: [{ field: 'value', name: t('quantity') }],
        },
        annotations: [
            {
                type: 'text',
                style: {
                    text: t('totalOrdersChart') + '\n' + totalOrders.toLocaleString('vi-VN'),
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 600,
                    fill: '#1f2937',
                    textBaseline: 'middle',
                },
            },
        ],
        animate: false,
    };

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>{t('orderStatus')}</Title>}
            bordered={false}
            hoverable
            style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 8 }} />
            ) : totalOrders === 0 ? (
                <Flex justify="center" align="center" style={{ height: 350 }}>
                    <Empty description={t('noOrderData')} />
                </Flex>
            ) : (
                <div style={{ height: 350 }}>
                    <Pie {...config as any} />
                </div>
            )}
        </Card>
    );
}