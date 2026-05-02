"use client";

import React from 'react';
import { Typography, Space, Row, Col } from 'antd';
import MetricsCards from '@/components/admin/dashboard/metrics-cards';
import dynamic from 'next/dynamic';
import RecentOrders from '@/components/admin/dashboard/recent-orders';

const RevenueChart = dynamic(() => import('@/components/admin/dashboard/revenue-chart'), { ssr: false });
const OrderStatusChart = dynamic(() => import('@/components/admin/dashboard/order-status-chart'), { ssr: false });

const { Title, Text } = Typography;

export default function DashboardContent() {
    return (
        <div style={{ padding: '4px 0' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2} style={{ marginBottom: 4 }}>Tổng quan Dashboard</Title>
                    <Text type="secondary">Chào mừng trở lại! Dưới đây là tóm tắt tình hình kinh doanh của hệ thống.</Text>
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
