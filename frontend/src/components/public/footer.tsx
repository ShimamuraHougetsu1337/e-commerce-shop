'use client';

import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  return (
    <AntFooter style={{
      backgroundColor: '#fff',
      textAlign: 'center',
      padding: '10px 0',
      borderTop: '1px solid #f0f0f0'
    }}>
      <Text style={{
        color: '#8c8c8c',
        letterSpacing: '1px',
        fontSize: '14px'
      }}>
        Được thực hiện bằng cả trái tim ❤️ bởi Shimamura Hougetsu
      </Text>
    </AntFooter>
  );
}