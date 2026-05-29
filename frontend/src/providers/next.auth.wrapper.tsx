'use client';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

const SessionGuard = ({ children }: React.PropsWithChildren) => {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.error === 'RefreshAccessTokenError') {
            signOut({ callbackUrl: '/auth/login' });
        }
    }, [session]);

    return <>{children}</>;
};

const NextAuthWrapper = ({ children }: React.PropsWithChildren) => (
    <SessionProvider refetchInterval={5 * 60}>
        <SessionGuard>
            {children}
        </SessionGuard>
    </SessionProvider>
);

export default NextAuthWrapper;