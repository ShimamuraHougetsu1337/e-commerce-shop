import LuckyWheel from "@/components/gamification/lucky-wheel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata = {
    title: 'Vòng quay may mắn | TicketRush',
    description: 'Quay thưởng hằng ngày để nhận mã giảm giá hấp dẫn từ TicketRush.',
};

async function getInitialData(accessToken: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const [statusRes, historyRes] = await Promise.all([
            fetch(`${baseUrl}/api/v1/gamification/status`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                next: { revalidate: 0 }
            }).then(res => res.json()),
            fetch(`${baseUrl}/api/v1/gamification/history`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                next: { revalidate: 0 }
            }).then(res => res.json())
        ]);

        return {
            status: statusRes?.data || null,
            history: historyRes?.data || []
        };
    } catch (error) {
        console.error('Failed to fetch initial lucky wheel data:', error);
        return { status: null, history: [] };
    }
}

export default async function LuckyWheelPage() {
    const session = await getServerSession(authOptions);
    let initialData = { status: null, history: [] };

    if (session?.accessToken) {
        initialData = await getInitialData(session.accessToken);
    }

    return (
        <div className="main-content">
            <LuckyWheel 
                initialStatus={initialData.status} 
                initialHistory={initialData.history} 
            />
        </div>
    );
}

