"use client";

import { InfoCircleOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import { useTranslations } from 'next-intl';

export default function RulesCard() {
    const t = useTranslations('Gamification');

    return (
        <Card
            title={<><InfoCircleOutlined style={{ marginRight: 8 }} /> {t('rules')}</>}
            bordered={true}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
            <ul style={{ paddingLeft: 20, margin: 0, color: '#595959', lineHeight: '2' }}>
                <li>{t('rule1')}</li>
                <li>{t('rule2')}</li>
                <li>{t('rule3')}</li>
            </ul>
        </Card>
    );
}
