"use client";

import React, { useState } from 'react';
import { Layout } from 'antd';
import AdminSidebar from './admin-sidebar';
import AdminHeader from './admin-header';

const { Content } = Layout;

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AdminSidebar collapsed={collapsed} />
            <Layout style={{ 
                marginLeft: collapsed ? 80 : 260, 
                transition: 'all 0.2s',
                backgroundColor: '#f5f7fa' 
            }}>
                <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content style={{ padding: 24, minHeight: 280 }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
