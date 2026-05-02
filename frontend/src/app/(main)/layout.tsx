import React from 'react';
import AppFooter from '@/components/public/footer';
import AppHeader from '@/components/public/header';
import { Layout } from 'antd';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            <AppHeader />
            {children}
            <AppFooter
            />
        </Layout>
    );
};

export default AdminLayout;
