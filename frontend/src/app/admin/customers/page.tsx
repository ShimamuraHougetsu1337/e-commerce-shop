import { authOptions } from '@/lib/auth';
import CustomerTable from '@/components/admin/customers/customer-table';
import { fetchCustomersList } from '@/utils/admin.api';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function CustomersPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    const initialData = await fetchCustomersList({
        current: 1,
        pageSize: 10,
        accessToken: session.accessToken as string
    });

    return (
        <main>
            <CustomerTable initialData={initialData} />
        </main>
    );
}