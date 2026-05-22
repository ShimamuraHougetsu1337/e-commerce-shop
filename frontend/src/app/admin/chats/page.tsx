import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdminChatClient from "@/components/admin/chat/AdminChatClient";
import { redirect } from "next/navigation";

export default async function AdminChatPage() {
    const session = await getServerSession(authOptions);

    // 1. Bảo vệ trang Admin ngay trên Server
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'SUPER_ADMIN')) {
        redirect('/');
    }

    // 2. Fetch dữ liệu danh sách chat ngay trên Server (Tối ưu SEO/FCP)
    let initialActiveChats = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/active-chats`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${session?.accessToken}`
            }
        });
        const result = await res.json();
        initialActiveChats = result.data || [];
    } catch (error) {
        console.error("Failed to fetch active chats on server:", error);
    }

    return (
        <div className="p-4">
            <AdminChatClient
                initialActiveChats={initialActiveChats}
                adminId={(session.user as any)._id || (session.user as any).id}
                accessToken={session?.accessToken as string}
            />
        </div>
    );
}
