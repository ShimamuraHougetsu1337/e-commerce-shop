'use client';

import { Layout, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  const t = useTranslations('AppFooter');
  
  return (
    <AntFooter style={{
      backgroundColor: '#fff',
      textAlign: 'center',
      padding: '10px 0',
      borderTop: '1px solid #f0f0f0',
    }}>
      <Text style={{
        color: '#8c8c8c',
        letterSpacing: '1px',
        fontSize: '14px'
      }}>
        {t('madeWithLove')}
      </Text>
    </AntFooter>
  );
}