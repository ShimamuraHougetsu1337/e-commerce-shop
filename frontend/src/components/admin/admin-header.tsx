"use client";

import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Space, Typography } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/public/language-switcher';
import NotificationBell from '@/components/public/notification-bell';

const { Header } = Layout;
const { Text } = Typography;

export default function AdminHeader({ collapsed, setCollapsed }: {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void
}) {
    const t = useTranslations('AdminHeader');
    const { data: session } = useSession();

    const userMenuItems = [
        { key: 'profile', icon: <UserOutlined />, label: <Link href="/profile">{t('profile')}</Link> },
        { key: 'logout', icon: <LogoutOutlined />, label: t('logout'), danger: true, onClick: () => signOut() },
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

            <Space size="large" align="center">
                <LanguageSwitcher />
                <NotificationBell />
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                    <Space style={{ cursor: 'pointer' }}>
                        <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <Text strong style={{ fontSize: 13 }}>{session?.user?.name || t('admin')}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>{session?.user?.role || t('adminRole')}</Text>
                        </div>
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
}
