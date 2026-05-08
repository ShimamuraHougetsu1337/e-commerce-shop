"use client";

import { Result, Spin } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const t = useTranslations('AuthGuard');
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
                    title={t('unauthenticatedTitle')}
                    subTitle={t('unauthenticatedDesc')}
                />
            </div>
        );
    }

    return <>{children}</>;
}