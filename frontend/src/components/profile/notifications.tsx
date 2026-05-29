'use client';

import React from 'react';
import { Card, Empty, Flex, List, Spin, Typography, Button, Avatar, Badge, Space } from 'antd';
import {
  BellOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotificationStore } from '@/store/useNotificationStore';
import { INotification } from '@/utils/notification.api';

const { Title, Paragraph, Text } = Typography;
dayjs.extend(relativeTime);

interface ProfileNotificationsProps {
  accessToken: string;
}

export default function ProfileNotifications({ accessToken }: ProfileNotificationsProps) {
  const t = useTranslations('Notifications');
  const router = useRouter();
  const { data: session } = useSession();

  const {
    notifications,
    unreadCount,
    totalCount,
    currentPage,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  React.useEffect(() => {
    if (accessToken) {
      fetchNotifications(accessToken, 1, 10);
    }
  }, [accessToken, fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    let icon = <BellOutlined />;
    let color = '#3b82f6';
    let bg = '#eff6ff';

    switch (type) {
      case 'ORDER_PENDING':
        icon = <ClockCircleOutlined />;
        color = '#d97706';
        bg = '#fffbeb';
        break;
      case 'ORDER_CONFIRMED':
        icon = <CheckCircleOutlined />;
        color = '#0891b2';
        bg = '#ecfeff';
        break;
      case 'ORDER_PREPARING':
        icon = <SyncOutlined spin />;
        color = '#2563eb';
        bg = '#eff6ff';
        break;
      case 'ORDER_SHIPPING':
        icon = <RocketOutlined />;
        color = '#ea580c';
        bg = '#fff7ed';
        break;
      case 'ORDER_DELIVERED':
      case 'ORDER_COMPLETED':
        icon = <CheckCircleOutlined />;
        color = '#16a34a';
        bg = '#f0fdf4';
        break;
      case 'ORDER_CANCELLED':
        icon = <CloseCircleOutlined />;
        color = '#dc2626';
        bg = '#fef2f2';
        break;
      case 'NEW_ORDER_ADMIN':
        icon = <ShoppingOutlined />;
        color = '#8b5cf6';
        bg = '#f5f3ff';
        break;
    }

    return (
      <Avatar
        style={{
          backgroundColor: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          width: '42px',
          height: '42px',
        }}
        icon={icon}
      />
    );
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      await markAsRead(notif._id, accessToken);
    }

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
    if (isAdmin) {
      router.push('/admin/orders');
    } else {
      router.push('/profile?tab=orders');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(accessToken);
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card bordered={false} className="profile-card" style={{ borderRadius: 16 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }} wrap="wrap" gap="middle">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {t('title')} {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#1677ff', marginLeft: 8 }} />}
          </Title>
          <Text type="secondary">{t('unreadCount', { count: unreadCount })}</Text>
        </div>
        {unreadCount > 0 && (
          <Button
            type="primary"
            onClick={handleMarkAllRead}
            icon={<CheckOutlined />}
            style={{ borderRadius: 8 }}
          >
            {t('markAllRead')}
          </Button>
        )}
      </Flex>

      {notifications.length === 0 ? (
        <Empty
          description={t('noNotifications')}
          style={{ padding: '60px 0' }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: totalCount,
            onChange: (page) => {
              fetchNotifications(accessToken, page, 10);
            },
            showSizeChanger: false,
            style: { marginTop: 24, textAlign: 'right' }
          }}
          renderItem={(item) => (
            <div
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: item.isRead ? 'transparent' : '#f0f7ff',
                marginBottom: '10px',
                border: '1px solid',
                borderColor: item.isRead ? '#f1f5f9' : '#e0efff',
                boxShadow: item.isRead ? 'none' : '0 2px 8px rgba(22, 119, 255, 0.05)',
              }}
              className="notification-list-item-hover"
            >
              <Flex gap="middle" align="center">
                {getNotificationIcon(item.type)}
                <div style={{ flex: 1 }}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                    <Text strong={!item.isRead} style={{ fontSize: '15px', color: '#1e293b' }}>
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </Flex>
                  <Paragraph style={{ margin: '4px 0 0', color: '#475569', fontSize: '13px' }}>
                    {item.message}
                  </Paragraph>
                </div>
                {!item.isRead && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#1677ff',
                      flexShrink: 0,
                      boxShadow: '0 0 0 2px rgba(22, 119, 255, 0.2)',
                    }}
                  />
                )}
              </Flex>
            </div>
          )}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .notification-list-item-hover {
          transition: all 0.2s ease;
        }
        .notification-list-item-hover:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
      ` }} />
    </Card>
  );
}
