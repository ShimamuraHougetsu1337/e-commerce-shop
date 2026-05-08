"use client";

import MetricsCards from '@/components/admin/dashboard/metrics-cards';
import RecentOrders from '@/components/admin/dashboard/recent-orders';
import { Col, Row, Space, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const RevenueChart = dynamic(() => import('@/components/admin/dashboard/revenue-chart'), { ssr: false });
const OrderStatusChart = dynamic(() => import('@/components/admin/dashboard/order-status-chart'), { ssr: false });

const { Title, Text } = Typography;

export default function DashboardContent() {
    const t = useTranslations('AdminDashboard');
    return (
        <div style={{ padding: '4px 0' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2} style={{ marginBottom: 4 }}>{t('overview')}</Title>
                    <Text type="secondary">{t('welcomeMsg')}</Text>
                </div>

                {/* Metrics Cards Section */}
                <MetricsCards />

                {/* Charts Section */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <RevenueChart />
                    </Col>
                    <Col xs={24} lg={8}>
                        <OrderStatusChart />
                    </Col>
                </Row>

                {/* Recent Orders Section */}
                <RecentOrders />
            </Space>
        </div>
    );
}
