"use client";

import {
  DashboardOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  StarOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { Sider } = Layout;

export default function AdminSidebar({ collapsed }: { collapsed: boolean }) {
    const t = useTranslations('AdminDashboard');
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { key: '/admin', icon: <DashboardOutlined />, label: t('dashboard') },
        { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: t('ordersMenu') },
        { key: '/admin/products', icon: <ShoppingOutlined />, label: t('productsMenu') },
        { key: '/admin/categories', icon: <TagsOutlined />, label: t('categoriesMenu') },
        { key: '/admin/customers', icon: <UserOutlined />, label: t('customersMenu') },
        { key: '/admin/coupons', icon: <TagsOutlined />, label: t('couponsMenu') },
        { key: '/admin/reviews', icon: <StarOutlined />, label: t('reviewsMenu') },
        { key: '/admin/chats', icon: <MessageOutlined />, label: 'Hỗ trợ khách hàng' },
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
