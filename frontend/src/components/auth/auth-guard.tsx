"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spin, Result } from "antd";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathName = usePathname()
    const { data: session, status } = useSession();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || status === 'loading') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Result
                    status="403"
                    title="Bạn chưa đăng nhập"
                    subTitle="Vui lòng đăng nhập để có thể truy cập vào trang này."

                />
            </div>
        );
    }

    return <>{children}</>;
}