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
    UserOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { App, Avatar, Breadcrumb, Button, Card, Flex, Menu, Spin, Typography, Upload, Tooltip } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getAvatarUrl, updateProfileApi } from '@/utils/user.api';

export default function ProfileClient({ session: initialSession }: { session: any }) {
    const t = useTranslations('ProfileClient');
    const { message } = App.useApp();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const { data: session, update } = useSession();
    const currentSession = session || initialSession;

    const [activeKey, setActiveKey] = useState(tabParam || 'settings');
    const [isMounted, setIsMounted] = useState(false);
    const [displayName, setDisplayName] = useState<string>(currentSession?.user?.name || t('member'));
    const [avatar, setAvatar] = useState<string>(currentSession?.user?.avatar || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { Title, Text } = Typography;

    useEffect(() => {
        if (currentSession?.user?.name) {
            setDisplayName(currentSession.user.name);
        }
    }, [currentSession?.user?.name]);

    useEffect(() => {
        if (currentSession?.user?.avatar) {
            setAvatar(currentSession.user.avatar);
        }
    }, [currentSession?.user?.avatar]);

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

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên tệp JPG/JPEG/PNG!');
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Kích thước ảnh không được vượt quá 5MB!');
        }
        return isJpgOrPng && isLt5M;
    };

    const handleAvatarChange = async (info: any) => {
        if (info.file.status === 'uploading') {
            setIsUploading(true);
            return;
        }
        if (info.file.status === 'done') {
            const fileName = info.file.response?.data?.fileName || info.file.response?.fileName;
            if (fileName) {
                try {
                    // Update database immediately
                    const res = await updateProfileApi({ avatar: fileName }, currentSession.accessToken);
                    if (res && res.data) {
                        setAvatar(fileName);
                        message.success('Cập nhật ảnh đại diện thành công!');
                        // Update NextAuth session
                        await update({ avatar: fileName });
                    } else {
                        message.error(res?.message || 'Không thể cập nhật ảnh đại diện');
                    }
                } catch (err) {
                    message.error('Có lỗi xảy ra khi cập nhật ảnh đại diện');
                }
            } else {
                message.error('Tải ảnh lên thất bại');
            }
            setIsUploading(false);
        } else if (info.file.status === 'error') {
            message.error('Tải ảnh lên thất bại');
            setIsUploading(false);
        }
    };

    const menuItems = [
        { key: 'settings', icon: <UserOutlined />, label: t('accountInfo') },
        { key: 'orders', icon: <ShoppingOutlined />, label: t('manageOrders') },
        { key: 'reviews', icon: <StarOutlined />, label: t('productReviews') },
        { key: 'notifications', icon: <BellOutlined />, label: t('notifications') },
    ];

    const renderContent = () => {
        switch (activeKey) {
            case 'settings':
                return <AccountSettings user={currentSession.user} avatar={avatar} accessToken={currentSession.accessToken} onNameUpdate={setDisplayName} />;
            case 'orders':
                return <OrderHistory accessToken={currentSession.accessToken} />;
            case 'reviews':
                return <Reviews />;
            case 'notifications':
                return <ProfileNotifications accessToken={currentSession.accessToken} />;
            default:
                return <AccountSettings user={currentSession.user} avatar={avatar} accessToken={currentSession.accessToken} onNameUpdate={setDisplayName} />;
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
                                <Upload
                                    name="file"
                                    showUploadList={false}
                                    action={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-avatar`}
                                    onChange={handleAvatarChange}
                                    beforeUpload={beforeUpload}
                                >
                                    <Tooltip title="Thay đổi ảnh đại diện">
                                        <div
                                            style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', overflow: 'hidden' }}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            <Avatar
                                                size={84}
                                                src={getAvatarUrl(avatar)}
                                                icon={<UserOutlined />}
                                                style={{ backgroundColor: '#3b82f6', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                background: 'rgba(0, 0, 0, 0.45)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                opacity: isHovered || isUploading ? 1 : 0,
                                                transition: 'opacity 0.3s',
                                                borderRadius: '50%',
                                                zIndex: 10
                                            }}>
                                                {isUploading ? <Spin size="small" /> : <UploadOutlined style={{ fontSize: 18 }} />}
                                            </div>
                                        </div>
                                    </Tooltip>
                                </Upload>
                                <Title level={4} style={{ margin: '16px 0 4px' }}>{displayName}</Title>
                                <Text type="secondary" style={{ marginBottom: 16 }}>{currentSession?.user?.email}</Text>
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


