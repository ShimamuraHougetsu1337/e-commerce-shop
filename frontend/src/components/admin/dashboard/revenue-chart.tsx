"use client";

import { fetchAdminStats } from '@/utils/admin.api';
import { Column } from '@ant-design/plots';
import { Card, Empty, Flex, Skeleton, Typography } from 'antd';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const { Title } = Typography;

export default function RevenueChart() {
    const { data: session } = useSession();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getRevenueData = async () => {
            if (session?.accessToken) {
                try {
                    const res = await fetchAdminStats(session.accessToken);
                    if (res.data?.revenueByDay) {
                        const formattedData = res.data.revenueByDay.map((item: any) => ({
                            date: dayjs(item._id).format('DD/MM'),
                            revenue: item.revenue,
                            orders: item.orders
                        }));
                        setData(formattedData);
                    }
                } catch (error) {
                    console.error("Failed to fetch revenue data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        getRevenueData();
    }, [session]);

    const formatNumber = (num: number | undefined | null) => {
        if (num === undefined || num === null || isNaN(num)) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    const config = {
        data,
        xField: 'date',
        yField: 'revenue',
        label: {
            position: 'top',
            style: {
                fill: '#595959',
                opacity: 0.8,
                fontSize: 12,
                fontWeight: 500,
            },
            formatter: (datum: any) => formatNumber(datum.revenue),
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
                style: {
                    fill: '#8c8c8c',
                }
            },
        },
        yAxis: {
            label: {
                formatter: (v: string) => formatNumber(Number(v)),
                style: {
                    fill: '#8c8c8c',
                }
            },
            grid: {
                line: {
                    style: {
                        stroke: '#f0f0f0',
                        lineDash: [4, 4]
                    }
                }
            }
        },
        color: 'l(90) 0:#1677ff 1:#69b1ff', // Thêm hiệu ứng gradient nhẹ cho cột
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        tooltip: {
            customContent: (title: string, items: any[]) => {
                if (!items || items.length === 0) return null;
                const datum = items[0].data;
                return (
                    <div style={{ padding: '12px 8px' }}>
                        <div style={{ marginBottom: 12, fontWeight: 600, color: '#1f2937' }}>{title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 24 }}>
                            <span style={{ color: '#595959' }}>Doanh thu:</span>
                            <span style={{ fontWeight: 600, color: '#1677ff' }}>
                                {datum.revenue.toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#595959' }}>Số đơn hàng:</span>
                            <span style={{ fontWeight: 600, color: '#1f2937' }}>
                                {datum.orders} đơn
                            </span>
                        </div>
                    </div>
                );
            },
        },
    };

    const hasData = data.some(item => item.revenue > 0 || item.orders > 0);

    return (
        <Card
            title={<Title level={4} style={{ margin: 0, fontSize: 18 }}>Doanh thu 7 ngày gần nhất</Title>}
            bordered={false}
            hoverable
            style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 8 }} />
            ) : !hasData ? (
                <Flex justify="center" align="center" style={{ height: 350 }}>
                    <Empty description="Chưa có dữ liệu doanh thu" />
                </Flex>
            ) : (
                <div style={{ height: 350 }}>
                    <Column {...config as any} />
                </div>
            )}
        </Card>
    );
}