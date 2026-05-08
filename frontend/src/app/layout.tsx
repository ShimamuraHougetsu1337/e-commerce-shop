import ChatWidget from '@/components/chat/chat-widget';
import { AntdProvider } from '@/providers/antd.provider';
import NextAuthWrapper from '@/providers/next.auth.wrapper';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '@/lib/auth';
import './globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'E-commerce',
  description: 'E-commerce',
};

const RootLayout = async ({ children }: React.PropsWithChildren) => {
  const session = await getServerSession(authOptions)
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AntdRegistry>
            <NextAuthWrapper session={session}>
              <AntdProvider>
                {children}
              </AntdProvider>
            </NextAuthWrapper>
            <ChatWidget />
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;