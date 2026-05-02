"use client";

import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined,
    UserOutlined,
    BellOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

const { Header } = Layout;
const { Text } = Typography;

export default function AdminHeader({ collapsed, setCollapsed }: {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void
}) {
    const { data: session } = useSession();

    const userMenuItems = [
        { key: 'profile', icon: <UserOutlined />, label: <Link href="/profile">Thông tin cá nhân</Link> },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: () => signOut() },
    ];

    return (
        <Header style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            height: 64
        }}>
            <Space size="middle">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: '16px', width: 40, height: 40 }}
                />
            </Space>

            <Space size="large">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                    <Space style={{ cursor: 'pointer' }}>
                        <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <Text strong style={{ fontSize: 13 }}>{session?.user?.name || 'Admin'}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>{session?.user?.role || 'Quản trị viên'}</Text>
                        </div>
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
}
