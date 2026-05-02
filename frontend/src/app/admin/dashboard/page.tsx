import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardContent from '@/components/admin/dashboard/dashboard-content';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'NORMAL_USER') {
        redirect('/');
    }

    return <DashboardContent />;
}