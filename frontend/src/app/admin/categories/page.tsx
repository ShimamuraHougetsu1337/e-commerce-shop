import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CategoryTable from '@/components/admin/categories/category-table';
import { fetchCategoriesList } from '@/utils/admin.api';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    const initialData = await fetchCategoriesList({
        current: 1,
        pageSize: 10,
        accessToken: session.accessToken as string
    });

    return (
        <main>
            <CategoryTable initialData={initialData} />
        </main>
    );
}
