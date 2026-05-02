import React from 'react';
import AdminLayoutWrapper from '@/components/admin/admin-layout-wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard | E-Commerce',
    description: 'Hệ thống quản trị E-Commerce',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminLayoutWrapper>
            {children}
        </AdminLayoutWrapper>
    );
}
