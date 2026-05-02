'use client';
import React from 'react';
import { App, ConfigProvider } from 'antd';

export const AntdProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#10b981',
                    borderRadius: 8,
                },
                components: {
                    Layout: {
                        headerBg: '#ffffff',
                        headerPadding: '0 24px',
                        headerHeight: 64,
                        siderBg: '#ffffff',
                    },
                    Menu: {
                        itemSelectedBg: '#ecfdf5',
                        itemSelectedColor: '#10b981',
                        itemHoverBg: '#f0fdf4',
                    },
                },
            }}
        >
            <App>
                {children}
            </App>
        </ConfigProvider>
    );
};