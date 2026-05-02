'use client';

import {
  DashboardOutlined,
  HeartOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Badge, Button, Dropdown, Flex, Layout, Tooltip, Typography } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { signOut, useSession } from 'next-auth/react';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const router = useRouter();
  const pathName = usePathname();
  const { items: wishlistItems, hasFetched: wishlistFetched, fetchWishlist } = useWishlistStore();
  const { items: cartItems, hasFetched: cartFetched, fetchCart } = useCartStore();
  const { data: session, status } = useSession();


  React.useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      if (!wishlistFetched) fetchWishlist(session.accessToken);
      if (!cartFetched) fetchCart(session.accessToken);
    }
  }, [status, session, wishlistFetched, cartFetched, fetchWishlist, fetchCart]);

  const handleUserMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key === 'logout') {
      await signOut({ callbackUrl: '/login' });
    } else if (e.key === 'admin') {
      router.push('/admin');
    } else if (e.key === 'profile' || e.key === 'settings') {
      router.push('/profile');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    ...(session?.user?.role === 'SUPER_ADMIN' ? [
      {
        key: 'admin',
        icon: <DashboardOutlined />,
        label: 'Quản lý hệ thống',
      },
      {
        type: 'divider' as const,
      },
    ] : []),
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Tài khoản của tôi',
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'Cài đặt',
    // },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        backgroundColor: '#fff',
        padding: '0 0',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        height: 'auto',
        minHeight: '80px',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}
        wrap="wrap"
      >

        <Flex align="center" gap="large">
          <Link href={'/'} style={{ textDecoration: 'none' }}>
            <Flex align="center" gap="small">
              <div style={{
                width: 36,
                height: 36,
                backgroundColor: '#002766',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18
              }}>
                E
              </div>
              <Title level={3} style={{ margin: 0, color: '#000' }}>E-Commerce</Title>
            </Flex>
          </Link>
        </Flex>

        <Flex align="center" gap="middle">
          {status === 'authenticated' ? (
            <>
              <Badge count={wishlistItems?.length} showZero>
                <Tooltip title="Danh sách yêu thích">
                  <Link href={'/wishlist'}>
                    <Button type="text" icon={<HeartOutlined style={{ fontSize: 20 }} />} />
                  </Link>
                </Tooltip>
              </Badge>

              <Badge count={cartItems?.length} showZero>
                <Tooltip title="Giỏ hàng">
                  <Link href={'/cart'}>
                    <Button type="text" icon={<ShoppingOutlined style={{ fontSize: 20 }} />} />
                  </Link>
                </Tooltip>
              </Badge>

              <div>
                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                >
                  <Button type="text" style={{ padding: '4px 8px' }}>
                    <Avatar
                      size="small"
                      style={{ backgroundColor: '#1677ff', verticalAlign: 'middle' }}
                    >
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </Button>
                </Dropdown>
              </div>
            </>
          ) : (
            <Link href={`/login?callbackUrl=${pathName}`}>
              <Button type="primary">Đăng nhập</Button>
            </Link>
          )}
        </Flex>
      </Flex>
    </AntHeader >
  );
}