"use client";

import { CopyOutlined, TrophyOutlined } from '@ant-design/icons';
import { App, Button, Modal, Space, Tooltip, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Title, Text, Paragraph } = Typography;

interface ResultModalProps {
    visible: boolean;
    onClose: () => void;
    reward: any;
}

export default function ResultModal({ visible, onClose, reward }: ResultModalProps) {
    const t = useTranslations('Gamification');
    const { message } = App.useApp();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success(t('copied'));
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" type="primary" onClick={onClose} style={{ background: '#FF4D4F', borderColor: '#FF4D4F', borderRadius: 8 }}>
                    OK
                </Button>
            ]}
            centered
            width={400}
            styles={{ body: { textAlign: 'center', padding: '30px 20px' } }}
        >
            <TrophyOutlined style={{ fontSize: 70, color: '#FADB14', marginBottom: 16, filter: 'drop-shadow(0 4px 8px rgba(250, 173, 20, 0.4))' }} />
            <Title level={3} style={{ color: '#D46B08' }}>{t('winTitle')}</Title>
            <Paragraph style={{ fontSize: 17, marginBottom: 24 }}>
                {reward?.type === 'COUPON' ? t('winDesc', { reward: reward.label }) : t('rewardNone')}
            </Paragraph>

            {reward?.type === 'COUPON' && (
                <div style={{
                    padding: '20px',
                    background: '#FFFBE6',
                    border: '2px dashed #FFE58F',
                    borderRadius: 12,
                    position: 'relative'
                }}>
                    <Text style={{ display: 'block', marginBottom: 10, color: '#8C8C8C', textTransform: 'uppercase', fontSize: 12, letterSpacing: '1px' }}>
                        {t('couponCode', { code: '' })}
                    </Text>
                    <Space size="middle">
                        <Text strong style={{ fontSize: 28, color: '#52c41a', letterSpacing: '1px', fontFamily: 'monospace' }}>{reward.value}</Text>
                        <Tooltip title={t('copyCode')}>
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(reward.value)}
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    </Space>
                </div>
            )}
        </Modal>
    );
}
