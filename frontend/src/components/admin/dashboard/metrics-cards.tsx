"use client";

import { fetchAdminStats } from '@/utils/admin.api';
import {
  AppstoreOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Card, Col, Flex, Row, Skeleton, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    description: string;
    loading?: boolean;
}

const MetricCard = ({ title, value, icon, color, description, loading }: MetricCardProps) => (
    <Card
        bordered={false}
        hoverable
        style={{
            borderRadius: 20,
            height: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            border: '1px solid #f0f0f0'
        }}
        styles={{ body: { padding: '24px' } }}
    >
        {loading ? (
            <Flex align="center" gap={20}>
                <Skeleton.Avatar active size={60} shape="circle" />
                <div style={{ flex: 1 }}>
                    <Skeleton.Input active size="small" style={{ width: '40%', marginBottom: 8 }} />
                    <Skeleton.Input active size="large" style={{ width: '80%' }} />
                </div>
            </Flex>
        ) : (
            <Flex vertical gap={12}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: `${color}1A`,
                    color: color,
                    fontSize: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>

                <div>
                    <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.02em' }}>
                        {title}
                    </Text>
                    <div style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: '#111827',
                        marginTop: 4,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                    }}>
                        {value}
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {description}
                        </Text>
                    </div>
                </div>
            </Flex>
        )}
    </Card>
);

export default function MetricsCards() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            if (session?.accessToken) {
                try {
                    const res = await fetchAdminStats(session.accessToken);
                    if (res.data) {
                        setStats(res.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch stats:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        getStats();
    }, [session]);

    const metrics = [
        {
            title: 'Tổng doanh thu',
            value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString('vi-VN')} đ` : '0 đ',
            icon: <DollarCircleOutlined />,
            color: '#1677ff',
            description: 'Tính đến hiện tại'
        },
        {
            title: 'Tổng đơn hàng',
            value: stats?.totalOrders?.toLocaleString('vi-VN') || 0,
            icon: <ShoppingCartOutlined />,
            color: '#52c41a',
            description: 'Đã hoàn thành'
        },
        {
            title: 'Tổng khách hàng',
            value: stats?.totalCustomers?.toLocaleString('vi-VN') || 0,
            icon: <UserOutlined />,
            color: '#722ed1',
            description: 'Tài khoản đăng ký'
        },
        {
            title: 'Tổng sản phẩm',
            value: stats?.totalProducts?.toLocaleString('vi-VN') || 0,
            icon: <AppstoreOutlined />,
            color: '#fa8c16',
            description: 'Trong kho hàng'
        }
    ];

    return (
        <Row gutter={[24, 24]}>
            {metrics.map((metric, index) => (
                <Col xs={24} sm={12} xl={6} key={index}>
                    <MetricCard {...metric} loading={loading} />
                </Col>
            ))}
        </Row>
    );
}