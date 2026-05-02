"use client";

import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    UserOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Sider } = Layout;

export default function AdminSidebar({ collapsed }: { collapsed: boolean }) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
        { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Products' },
        { key: '/admin/categories', icon: <TagsOutlined />, label: 'Categories' },
        { key: '/admin/customers', icon: <UserOutlined />, label: 'Customers' },
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                borderRight: '1px solid #f0f0f0',
                zIndex: 100
            }}
            width={260}
        >
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                borderBottom: '1px solid #f0f0f0',
                fontWeight: 'bold',
                fontSize: 18,
                color: '#1677ff'
            }}>
                <Link href="/">
                    {collapsed ? 'EC' : 'E-Commerce'}
                </Link>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[pathname]}
                items={menuItems}
                style={{ borderRight: 0, marginTop: 16 }}
                onClick={({ key }) => router.push(key)}
            />
        </Sider>
    );
}
