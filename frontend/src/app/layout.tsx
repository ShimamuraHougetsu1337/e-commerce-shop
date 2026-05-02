import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdProvider } from '@/providers/antd.provider';
import './globals.css';
import NextAuthWrapper from '@/providers/next.auth.wrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import ChatWidget from '@/components/chat/chat-widget';

export const metadata = {
  title: 'E-commerce',
  description: 'E-commerce',
};

const RootLayout = async ({ children }: React.PropsWithChildren) => {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <NextAuthWrapper session={session}>
            <AntdProvider>
              {children}
            </AntdProvider>
          </NextAuthWrapper>
          <ChatWidget />
        </AntdRegistry>
      </body>
    </html>
  );
}

export default RootLayout;