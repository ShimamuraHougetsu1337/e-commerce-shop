'use client';

import {
  DashboardOutlined,
  HeartOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  TrophyOutlined,
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
import SearchAutocomplete from './search.autocomplete';
import LanguageSwitcher from './language-switcher';
import { useTranslations } from 'next-intl';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const t = useTranslations('AppHeader');
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
        label: t('admin'),
      },
      {
        type: 'divider' as const,
      },
    ] : []),
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile'),
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
      label: t('logout'),
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
        gap="middle"
      >

        <Flex align="center" gap="large" style={{ flexShrink: 0 }}>
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
              <Title level={3} style={{ margin: 0, color: '#000' }} className="desktop-only-block">E-Commerce</Title>
            </Flex>
          </Link>
        </Flex>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
          <SearchAutocomplete />
        </div>

        <Flex align="center" gap="middle" style={{ flexShrink: 0 }}>
          <LanguageSwitcher />
          {status === 'authenticated' ? (
            <>
              <Tooltip title={t('luckyWheel') || 'Vòng quay may mắn'}>
                <Link href={'/lucky-wheel'}>
                  <Button type="text" icon={<TrophyOutlined style={{ fontSize: 20, color: '#faad14' }} />} />
                </Link>
              </Tooltip>

              <Badge count={wishlistItems?.length} showZero size="small">
                <Tooltip title={t('wishlist')}>
                  <Link href={'/wishlist'}>
                    <Button type="text" icon={<HeartOutlined style={{ fontSize: 20 }} />} />
                  </Link>
                </Tooltip>
              </Badge>

              <Badge count={cartItems?.length} showZero size="small">
                <Tooltip title={t('cart')}>
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
              <Button type="primary">{t('login')}</Button>
            </Link>
          )}
        </Flex>
      </Flex>
    </AntHeader >
  );
}