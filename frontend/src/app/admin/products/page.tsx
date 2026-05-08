import { authOptions } from '@/lib/auth';
import ProductTable from '@/components/admin/products/product-table';
import { fetchProductsList } from '@/utils/admin.api';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    const initialData = await fetchProductsList({
        current: 1,
        pageSize: 10,
        accessToken: session.accessToken as string
    });

    return (
        <main>
            <ProductTable initialData={initialData} />
        </main>
    );
}