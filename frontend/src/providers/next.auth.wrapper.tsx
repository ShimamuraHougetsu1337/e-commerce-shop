'use client'
import { SessionProvider } from 'next-auth/react';

const NextAuthWrapper = ({ children, session }: React.PropsWithChildren & { session: any }) => (
    <SessionProvider session={session}>
        {children}
    </SessionProvider>

);

export default NextAuthWrapper;