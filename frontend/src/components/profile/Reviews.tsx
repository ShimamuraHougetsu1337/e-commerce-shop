'use client';

import { getMyReviewsApi } from '@/utils/user.api';
import { Card, Empty, Flex, List, Rate, Spin, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

const Reviews = () => {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (session?.accessToken) {
                try {
                    const res = await getMyReviewsApi(session.accessToken);
                    if (res && res.data) {
                        setReviews(res.data);
                    }
                } catch (error) {
                    console.error('Fetch reviews error:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchReviews();
    }, [session]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" tip="Đang tải đánh giá..." />
            </div>
        );
    }

    return (
        <Card bordered={false} className="profile-card">
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Đánh giá của tôi</Title>
                <Text type="secondary">Quản lý các nhận xét bạn đã để lại cho sản phẩm</Text>
            </div>

            {reviews.length === 0 ? (
                <Empty
                    description="Bạn chưa có đánh giá nào"
                    style={{ padding: '40px 0' }}
                />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={reviews}
                    renderItem={(item) => (
                        <Card
                            key={item._id}
                            size="small"
                            style={{
                                marginBottom: 16,
                                borderRadius: 16,
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                        >
                            <Flex gap="large" align="flex-start">
                                <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                                    <Link href={`/products/${item.productId?._id}`}>
                                        <img
                                            src={item.productId?.images?.[0] || '/placeholder.png'}
                                            alt={item.productId?.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 12,
                                                border: '1px solid #f1f5f9',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </Link>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Flex justify="space-between" align="flex-start">
                                        <div>
                                            <Link href={`/products/${item.productId?._id}`}>
                                                <Text strong style={{ fontSize: 16, cursor: 'pointer', display: 'block' }} className="hover-blue">
                                                    {item.productId?.name}
                                                </Text>
                                            </Link>
                                            <div style={{ marginTop: 4 }}>
                                                <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                                            </div>
                                        </div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Flex>
                                    <Paragraph
                                        style={{
                                            marginTop: 12,
                                            marginBottom: 0,
                                            color: '#64748b',
                                            lineHeight: 1.6,
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        &quot;{item.comment}&quot;
                                    </Paragraph>

                                    {item.images && item.images.length > 0 && (
                                        <Flex gap="small" style={{ marginTop: 12 }}>
                                            {item.images.map((img: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt={`review-${idx}`}
                                                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                                                />
                                            ))}
                                        </Flex>
                                    )}
                                </div>
                            </Flex>
                        </Card>
                    )}
                />
            )}

        </Card>
    );
};

export default Reviews;
