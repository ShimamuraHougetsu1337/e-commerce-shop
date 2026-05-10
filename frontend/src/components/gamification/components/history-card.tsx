"use client";

import { CopyOutlined, HistoryOutlined, TrophyOutlined } from '@ant-design/icons';
import { App, Button, Card, List, Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface HistoryCardProps {
    history: any[];
    loading: boolean;
}

export default function HistoryCard({ history, loading }: HistoryCardProps) {
    const t = useTranslations('Gamification');
    const { message } = App.useApp();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success(t('copied'));
    };

    return (
        <Card
            title={<><HistoryOutlined style={{ marginRight: 8 }} /> {t('history')}</>}
            bordered={true}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
            <List
                dataSource={history}
                loading={loading}
                locale={{ emptyText: t('noHistory') }}
                renderItem={(item: any) => (
                    <List.Item
                        extra={<Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.createdAt).format('DD/MM/YYYY')}</Text>}
                    >
                        <List.Item.Meta
                            avatar={<TrophyOutlined style={{ color: item.reward.type === 'COUPON' ? '#faad14' : '#bfbfbf', fontSize: 20 }} />}
                            title={<Text strong>{item.reward.label}</Text>}
                            description={item.reward.type === 'COUPON' ? (
                                <Space style={{ marginTop: 4 }}>
                                    <Text code>{item.reward.value}</Text>
                                    <Tooltip title={t('copyCode')}>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={() => copyToClipboard(item.reward.value)}
                                        />
                                    </Tooltip>
                                </Space>
                            ) : null}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}
