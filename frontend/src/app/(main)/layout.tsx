import AppFooter from '@/components/public/footer';
import AppHeader from '@/components/public/header';
import { Layout } from 'antd';
import React from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
            <AppHeader />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
                {children}
            </div>
            <AppFooter />
        </Layout>
    );
};

export default AdminLayout;
