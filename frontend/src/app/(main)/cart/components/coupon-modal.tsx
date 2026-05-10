"use client";

import { GiftOutlined, TagOutlined } from '@ant-design/icons';
import { Button, Empty, List, Modal, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface CouponModalProps {
    visible: boolean;
    onClose: () => void;
    initialCoupons: ICoupon[];
    session: any;
    totalPrice: number;
    onSelectCoupon: (code: string) => void;
}

export default function CouponModal({ visible, onClose, initialCoupons, session, totalPrice, onSelectCoupon }: CouponModalProps) {
    const t = useTranslations('CartPage');

    return (
        <Modal
            title={<span><GiftOutlined /> {t('discountForYou')}</span>}
            open={visible}
            onCancel={onClose}
            footer={null}
            styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
        >
            {initialCoupons.length === 0 ? (
                <Empty description={t('noDiscountCodes')} />
            ) : (
                <List
                    dataSource={initialCoupons}
                    renderItem={(coupon) => {
                        const userId = (session?.user as any)?.id || (session?.user as any)?._id;
                        const isUsed = coupon.usedBy && userId && coupon.usedBy.includes(userId);

                        return (
                            <List.Item
                                actions={[
                                    isUsed ? (
                                        <Button key="used" size="small" disabled style={{ color: '#ff4d4f', background: '#fff1f0', border: '1px solid #ffa39e' }}>
                                            {t('used')}
                                        </Button>
                                    ) : (
                                        <Button 
                                            key="use" 
                                            type="primary" 
                                            size="small"
                                            disabled={totalPrice < coupon.minOrderValue}
                                            onClick={() => onSelectCoupon(coupon.code)}
                                        >
                                            {t('useNow')}
                                        </Button>
                                    )
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <TagOutlined style={{ color: '#1677ff' }} />
                                            <Text strong style={{ fontSize: 16, textTransform: 'uppercase' }}>{coupon.code}</Text>
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <div style={{ color: '#f5222d', fontWeight: 500, marginBottom: 4 }}>
                                                {t('discount')} {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString('vi-VN')}đ`}
                                            </div>
                                            <div style={{ fontSize: 12 }}>
                                                {t('minOrder')}: {coupon.minOrderValue.toLocaleString('vi-VN')}đ
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            )}
        </Modal>
    );
}
