import { authOptions } from '@/lib/auth';
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";

export const metadata = {
    title: 'Hồ sơ cá nhân',
    description: 'Quản lý thông tin cá nhân và đơn hàng của bạn',
};

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <ProfileClient session={session} />
    );
}