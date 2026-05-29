import ChatWidget from '@/components/chat/chat-widget';
import { AntdProvider } from '@/providers/antd.provider';
import NextAuthWrapper from '@/providers/next.auth.wrapper';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import React from 'react';
import './globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

import { SocketProvider } from '@/providers/socket.provider';

export const dynamic = 'force-dynamic';
// ... metadata code ...

const RootLayout = async ({ children }: React.PropsWithChildren) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AntdRegistry>
            <NextAuthWrapper>
              <AntdProvider>
                <SocketProvider>
                  {children}
                </SocketProvider>
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