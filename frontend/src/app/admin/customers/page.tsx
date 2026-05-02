import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CustomerTable from '@/components/admin/customers/customer-table';
import { fetchCustomersList } from '@/utils/admin.api';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function CustomersPage() {
    // Lấy session từ server để lấy accessToken
    const session = await getServerSession(authOptions);

    // Kiểm tra quyền hạn (Role check)
    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    // Fetch dữ liệu khởi tạo trên Server
    // Tận dụng Native Fetch và cơ chế Caching của App Router
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