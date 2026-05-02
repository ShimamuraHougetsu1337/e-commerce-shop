import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/admin/dashboard/dashboard-content';

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    return <DashboardContent />;
}