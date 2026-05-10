"use client";

import { useCartStore } from '@/store/useCartStore';
import { DeleteOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Divider, InputNumber, Row, Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface CartItemsProps {
    session: any;
}

export default function CartItems({ session }: CartItemsProps) {
    const t = useTranslations('CartPage');
    const { items, removeItem, updateQuantity } = useCartStore();
    const { message } = App.useApp();

    const handleRemove = async (id: string, name: string) => {
        if (!session?.accessToken) return;
        await removeItem(id, session.accessToken);
        message.info(t('removedFromCart', { productName: name }));
    };

    return (
        <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, overflow: 'hidden' }}>
            {items.map((item, index) => (
                <div key={item._id}>
                    <Row style={{ padding: '20px' }} align="middle">
                        <Col xs={6} sm={4}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                                <Image
                                    src={item.images?.[0] ?? '/placeholder.png'}
                                    alt={item.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </Col>
                        <Col xs={18} sm={10} style={{ paddingLeft: '16px' }}>
                            <Link href={`/products/${item._id}`}>
                                <Text strong style={{ fontSize: 16, display: 'block' }}>{item.name}</Text>
                            </Link>
                            <Text type="secondary" style={{ fontSize: 13 }}>{t('remaining')}: {item.stock_quantity}</Text>
                        </Col>
                        <Col xs={12} sm={5} style={{ textAlign: 'center', marginTop: '12px' }}>
                            <InputNumber
                                min={1}
                                max={item.stock_quantity}
                                value={item.quantity}
                                onChange={(val) => val && session?.accessToken && updateQuantity(item._id, val, session.accessToken)}
                            />
                        </Col>
                        <Col xs={8} sm={4} style={{ textAlign: 'right', marginTop: '12px' }}>
                            <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                            </Text>
                        </Col>
                        <Col xs={4} sm={1} style={{ textAlign: 'right', marginTop: '12px' }}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(item._id, item.name)}
                            />
                        </Col>
                    </Row>
                    {index < items.length - 1 && <Divider style={{ margin: 0 }} />}
                </div>
            ))}
        </Card>
    );
}
