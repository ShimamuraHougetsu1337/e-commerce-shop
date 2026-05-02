

import React from 'react';
import OrderTable from '@/components/admin/orders/order-table';
import { fetchOrdersList } from '@/utils/admin.api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    const initialData = await fetchOrdersList({
        current: 1,
        pageSize: 10,
        accessToken: session.accessToken as string
    });

    return (
        <main>
            <OrderTable initialData={initialData} />
        </main>
    );
}