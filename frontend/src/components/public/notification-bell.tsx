'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

import styles from './notification-bell.module.css';

import {
  Badge,
  Popover,
  List,
  Avatar,
  Button,
  Spin,
  Empty,
  Typography,
  App,
  Flex,
  Tooltip,
} from 'antd';
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

import { useSocket } from '@/providers/socket.provider';
import { useNotificationStore } from '@/store/useNotificationStore';
import { INotification } from '@/utils/notification.api';

const { Text, Title } = Typography;

dayjs.extend(relativeTime);

export default function NotificationBell() {
  const t = useTranslations('Notifications');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { socket } = useSocket();
  const { notification: antNotification } = App.useApp();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  } = useNotificationStore();

  const [visible, setVisible] = useState(false);

  // Set dayjs locale based on system language (VN by default)
  useEffect(() => {
    // Standard locales inside next-intl are usually mapped to html lang
    const lang = document.documentElement.lang || 'vi';
    dayjs.locale(lang);
  }, []);

  // Fetch initial notifications and unread count
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchNotifications(session.accessToken, 1, 10);
      fetchUnreadCount(session.accessToken);
    }
  }, [status, session, fetchNotifications, fetchUnreadCount]);

  // Setup realtime listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif: INotification) => {
      addNotification(notif);

      // Show high quality real-time toast alert
      antNotification.open({
        message: (
          <Text strong style={{ color: '#111827', fontSize: '14px' }}>
            {notif.title}
          </Text>
        ),
        description: (
          <Text style={{ color: '#4b5563', fontSize: '13px' }}>
            {notif.message}
          </Text>
        ),
        icon: getNotificationIcon(notif.type, 'primary'),
        placement: 'bottomRight',
        duration: 4.5,
        style: {
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
        },
      });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:admin', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:admin', handleNewNotification);
    };
  }, [socket, addNotification, antNotification]);

  // Return icons based on notification type
  const getNotificationIcon = (type: string, mode: 'avatar' | 'primary' = 'avatar') => {
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

    if (mode === 'primary') {
      return React.cloneElement(icon, { style: { color, fontSize: '22px' } });
    }

    return (
      <Avatar
        style={{
          backgroundColor: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
        }}
        icon={icon}
      />
    );
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (session?.accessToken) {
      // Mark as read in backend & store
      if (!notif.isRead) {
        await markAsRead(notif._id, session.accessToken);
      }

      setVisible(false);

      // Navigate appropriately
      const isAdmin = session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN';
      if (isAdmin) {
        router.push('/admin/orders');
      } else {
        router.push('/profile?tab=orders');
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (session?.accessToken) {
      await markAllAsRead(session.accessToken);
    }
  };

  // Notification list content
  const popoverContent = (
    <div style={{ width: 360 }}>
      {/* Popover Header */}
      <Flex justify="space-between" align="center" style={{ paddingBottom: 12, borderBottom: '1px solid #f3f4f6', marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
          {t('title')} {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#1677ff', marginLeft: 8 }} />}
        </Title>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllRead}
            icon={<CheckOutlined style={{ fontSize: '11px' }} />}
            style={{ fontSize: '12px', padding: 0, height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {t('markAllRead')}
          </Button>
        )}
      </Flex>

      {/* Popover List */}
      <div style={{ maxHeight: 380, overflowY: 'auto', margin: '0 -16px', padding: '0 16px' }}>
        {isLoading ? (
          <Flex justify="center" align="center" style={{ minHeight: 180 }}>
            <Spin size="small" />
          </Flex>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary" style={{ fontSize: '13px' }}>{t('noNotifications')}</Text>}
            style={{ padding: '32px 0' }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: item.isRead ? 'transparent' : '#eff6ff',
                  marginBottom: '4px',
                  borderBottom: 'none',
                }}
                className={styles.notificationItemHover}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(item.type)}
                  title={
                    <Flex justify="space-between" align="flex-start" gap={8}>
                      <Text strong={!item.isRead} style={{ color: '#1f2937', fontSize: '13px', lineHeight: 1.3 }}>
                        {item.title}
                      </Text>
                      {!item.isRead && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#1677ff',
                            flexShrink: 0,
                            marginTop: 5,
                            boxShadow: '0 0 0 2px rgba(22, 119, 255, 0.2)',
                          }}
                        />
                      )}
                    </Flex>
                  }
                  description={
                    <Flex vertical gap={4} style={{ marginTop: 2 }}>
                      <Text type="secondary" style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>
                        {item.message}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Popover Footer */}
      {notifications.length > 0 && (
        <div style={{ paddingTop: 8, borderTop: '1px solid #f3f4f6', marginTop: 8, textAlign: 'center' }}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setVisible(false);
              router.push('/profile?tab=notifications');
            }}
            style={{ fontSize: '13px', width: '100%' }}
          >
            {t('viewAll')}
          </Button>
        </div>
      )}
    </div>
  );

  if (status !== 'authenticated') return null;

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Popover
          content={popoverContent}
          trigger="click"
          open={visible}
          onOpenChange={setVisible}
          placement="bottomRight"
          arrow={{ pointAtCenter: true }}
          overlayClassName={styles.customNotificationPopover}
          overlayStyle={{ paddingTop: 8 }}
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <Badge count={unreadCount} size="small" style={{ boxShadow: '0 0 0 2px #ffffff' }}>
            <Tooltip title={t('title')}>
              <Button
                type="text"
                icon={
                  <BellOutlined
                    style={{
                      fontSize: 20,
                      transition: 'transform 0.3s ease',
                    }}
                  />
                }
                className="header-btn"
              />
            </Tooltip>
          </Badge>
        </Popover>
      </div>
    </>
  );
}
