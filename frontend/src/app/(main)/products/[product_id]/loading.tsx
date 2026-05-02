'use client';
import React from 'react';
import { Spin } from 'antd';

export default function Loading() {
    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}
        >
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#8c8c8c', fontWeight: 500 }}>
                Đang tải dữ liệu...
            </div>
        </div>
    );
}