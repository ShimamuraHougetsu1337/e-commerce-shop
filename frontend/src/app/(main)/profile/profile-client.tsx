'use client';

import AccountSettings from '@/components/profile/AccountSettings';
import OrderHistory from '@/components/profile/order-history';
import Reviews from '@/components/profile/Reviews';
import ProfileNotifications from '@/components/profile/notifications';
import {
  BellOutlined,
  HomeOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  StarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Card, Flex, Menu, Spin, Typography } from 'antd';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ProfileClient({ session }: { session: any }) {
    const t = useTranslations('ProfileClient');
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const [activeKey, setActiveKey] = useState(tabParam || 'settings');
    const [isMounted, setIsMounted] = useState(false);
    const [displayName, setDisplayName] = useState<string>(session?.user?.name || t('member'));
    const { Title, Text } = Typography;

    useEffect(() => {
        setIsMounted(true);
        if (tabParam) {
            setActiveKey(tabParam);
        }
    }, [tabParam]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);

    const menuItems = [
        { key: 'settings', icon: <UserOutlined />, label: t('accountInfo') },
        { key: 'orders', icon: <ShoppingOutlined />, label: t('manageOrders') },
        { key: 'reviews', icon: <StarOutlined />, label: t('productReviews') },
        { key: 'notifications', icon: <BellOutlined />, label: t('notifications') },
    ];

    const renderContent = () => {
        switch (activeKey) {
            case 'settings':
                return <AccountSettings user={session.user} accessToken={session.accessToken} onNameUpdate={setDisplayName} />;
            case 'orders':
                return <OrderHistory accessToken={session.accessToken} />;
            case 'reviews':
                return <Reviews />;
            case 'notifications':
                return <ProfileNotifications accessToken={session.accessToken} />;
            default:
                return <AccountSettings user={session.user} accessToken={session.accessToken} onNameUpdate={setDisplayName} />;
        }
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/login' });
    };

    if (!isMounted) {
        return (
            <div className="main-content" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="main-content profile-page-container">
            <Breadcrumb
                separator="/"
                style={{ marginBottom: 32 }}
                items={[
                    { title: <Link href="/"><HomeOutlined /> {t('home')}</Link> },
                    { title: t('profile') }
                ]}
            />

            <div className="profile-layout-wrapper">
                {/* Sidebar */}
                <aside className="profile-sidebar-area">
                    <div className="sticky-sidebar">
                        <Card bordered={false} className="user-profile-summary">
                            <Flex vertical align="center">
                                <Badge dot offset={[-5, 65]} color="green" style={{ width: 12, height: 12 }}>
                                    <Avatar
                                        size={84}
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: '#3b82f6', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </Badge>
                                <Title level={4} style={{ margin: '16px 0 4px' }}>{displayName}</Title>
                                <Text type="secondary" style={{ marginBottom: 16 }}>{session.user.email}</Text>
                            </Flex>
                        </Card>

                        <Menu
                            mode="inline"
                            selectedKeys={[activeKey]}
                            onClick={(e) => setActiveKey(e.key)}
                            className="custom-sidebar-menu"
                            items={menuItems}
                        />

                        <Button
                            block
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            {t('logout')}
                        </Button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="profile-content-area">
                    <div className="content-transition">
                        {renderContent()}
                    </div>
                </main>
            </div>

        </div>
    );
}


