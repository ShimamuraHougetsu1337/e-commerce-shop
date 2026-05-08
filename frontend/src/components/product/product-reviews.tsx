'use client';

import { createReviewApi, deleteReviewApi, getReviewsByProductApi, updateReviewApi } from '@/utils/user.api';
import { DeleteOutlined, EditOutlined, MessageOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Card, Col, Empty, Flex, Form, Input, List, Popconfirm, Rate, Row, Spin, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ProductReviewsProps {
    productId: string;
    onReviewSuccess?: () => void;
}

const ProductReviews = ({ productId, onReviewSuccess }: ProductReviewsProps) => {
    const t = useTranslations('ProductReviews');
    const { data: session } = useSession();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState({ current: 1, pageSize: 5, total: 0 });
    
    // Đánh giá cũ của user hiện tại (nếu có)
    const [userReview, setUserReview] = useState<any>(null);

    const fetchReviews = useCallback(async (current = 1) => {
        setLoading(true);
        try {
            const res = await getReviewsByProductApi(productId, current, meta.pageSize);
            if (res && res.data) {
                const allReviews = res.data.result;
                setReviews(allReviews);
                setMeta(res.data.meta);
                
                // Kiểm tra xem user hiện tại đã review chưa (dựa trên email hoặc id từ session)
                if (session?.user?.email) {
                    const found = allReviews.find((r: any) => r.userId?.email === session.user?.email);
                    if (found) {
                        setUserReview(found);
                        form.setFieldsValue({
                            rating: found.rating,
                            comment: found.comment
                        });
                    } else {
                        setUserReview(null);
                        form.resetFields();
                    }
                }
            }
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setLoading(false);
        }
    }, [productId, meta.pageSize, session, form]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const onFinish = async (values: any) => {
        if (!session?.accessToken) {
            message.warning(t('loginRequired'));
            return;
        }

        setSubmitting(true);
        try {
            let res;
            if (userReview) {
                // Chế độ UPDATE
                res = await updateReviewApi(userReview._id, {
                    rating: values.rating,
                    comment: values.comment
                }, session.accessToken);
            } else {
                // Chế độ CREATE
                res = await createReviewApi({
                    productId,
                    rating: values.rating,
                    comment: values.comment
                }, session.accessToken);
            }

            if (res && (res.statusCode === 201 || res.statusCode === 200)) {
                message.success(userReview ? t('reviewUpdated') : t('reviewSubmitted'));
                fetchReviews(1);
                if (onReviewSuccess) onReviewSuccess();
            } else {
                message.error(res?.message || t('errorOccurred'));
            }
        } catch (error) {
            message.error(t('submitError'));
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async () => {
        if (!session?.accessToken || !userReview) return;
        try {
            const res = await deleteReviewApi(userReview._id, session.accessToken);
            if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                message.success(t('deleteSuccess'));
                setUserReview(null);
                form.resetFields();
                fetchReviews(1);
                if (onReviewSuccess) onReviewSuccess();
            } else {
                message.error(res?.message || t('deleteError'));
            }
        } catch (error) {
            message.error(t('deleteError'));
        }
    };

    return (
        <div style={{ padding: '24px 0' }}>
            <Row gutter={[48, 32]}>
                {/* Review Form */}
                <Col xs={24} lg={10}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <Title level={4} style={{ marginBottom: 20 }}>
                            {userReview ? t('updateYourReview') : t('writeYourReview')}
                        </Title>
                        <Card 
                            bordered={false} 
                            style={{ 
                                background: userReview ? '#f0f9ff' : '#f8fafc', 
                                borderRadius: 16,
                                border: userReview ? '1px solid #bae6fd' : 'none'
                            }}
                        >
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                initialValues={{ rating: 0 }}
                            >
                                <Form.Item 
                                    name="rating" 
                                    label={t('starRating')} 
                                    rules={[
                                        { required: true, message: t('selectStarRequired') },
                                        { type: 'number', min: 1, message: t('minOneStar') }
                                    ]}
                                >
                                    <Rate style={{ fontSize: 28 }} />
                                </Form.Item>
                                
                                <Form.Item 
                                    name="comment" 
                                    label={t('yourComment')} 
                                    rules={[{ required: true, message: t('commentRequired') }]}
                                >
                                    <TextArea 
                                        rows={4} 
                                        placeholder={t('commentPlaceholder')} 
                                        maxLength={500}
                                        showCount
                                        style={{ borderRadius: 12 }}
                                    />
                                </Form.Item>

                                <Button 
                                    type={userReview ? "default" : "primary"}
                                    htmlType="submit" 
                                    block 
                                    size="large"
                                    loading={submitting}
                                    icon={userReview ? <EditOutlined /> : <MessageOutlined />}
                                    style={{ 
                                        height: 48, 
                                        borderRadius: 12, 
                                        marginTop: 8,
                                        backgroundColor: userReview ? '#0ea5e9' : undefined,
                                        color: userReview ? '#fff' : undefined,
                                        border: 'none'
                                    }}
                                >
                                    {userReview ? t('updateReviewBtn') : t('submitReviewBtn')}
                                </Button>
                                {userReview && (
                                    <Popconfirm title={t('deleteConfirm')} onConfirm={onDelete}>
                                        <Button
                                            danger
                                            block
                                            size="large"
                                            icon={<DeleteOutlined />}
                                            style={{ height: 48, borderRadius: 12, marginTop: 8 }}
                                        >
                                            {t('deleteReview')}
                                        </Button>
                                    </Popconfirm>
                                )}
                                {userReview && (
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginTop: 12 }}>
                                        {t('alreadyReviewed')}
                                    </Text>
                                )}
                            </Form>
                        </Card>
                    </div>
                </Col>

                {/* Reviews List */}
                <Col xs={24} lg={14}>
                    <Title level={4} style={{ marginBottom: 20 }}>
                        {t('allReviews')} ({meta.total})
                    </Title>
                    
                    {loading && reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                    ) : reviews.length === 0 ? (
                        <Empty description={t('noReviewsYet')} />
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={reviews}
                            pagination={{
                                onChange: (page) => fetchReviews(page),
                                pageSize: meta.pageSize,
                                total: meta.total,
                                current: meta.current,
                                hideOnSinglePage: true,
                                size: 'small',
                                style: { marginTop: 24, textAlign: 'center' }
                            }}
                            renderItem={(item) => {
                                const isOwnReview = item.userId?.email === session?.user?.email;
                                return (
                                    <List.Item 
                                        style={{ 
                                            padding: '20px 0', 
                                            borderBottom: '1px solid #f1f5f9',
                                            background: isOwnReview ? '#f0f9ff50' : 'transparent',
                                            borderRadius: isOwnReview ? 12 : 0,
                                            paddingLeft: isOwnReview ? 12 : 0
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar size={48} icon={<UserOutlined />} src={item.userId?.avatar} />}
                                            title={
                                                <Flex justify="space-between" align="center">
                                                    <Space>
                                                        <Text strong style={{ fontSize: 15 }}>{item.userId?.name}</Text>
                                                        {isOwnReview && <Tag color="blue">{t('yourReviewTag')}</Tag>}
                                                    </Space>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                    </Text>
                                                </Flex>
                                            }
                                            description={
                                                <div style={{ marginTop: 4 }}>
                                                    <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                                                    <Paragraph style={{ marginTop: 12, color: '#4b5563', lineHeight: 1.6, fontSize: 14 }}>
                                                        {item.comment}
                                                    </Paragraph>
                                                    {item.adminReply && (
                                                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0f9ff', borderRadius: 8, borderLeft: '3px solid #1677ff' }}>
                                                            <Space size={4} style={{ marginBottom: 4 }}>
                                                                <ShopOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                                                                <Text strong style={{ fontSize: 12, color: '#1677ff' }}>{t('shopReply')}</Text>
                                                            </Space>
                                                            <Paragraph style={{ margin: 0, fontSize: 13, color: '#374151' }}>{item.adminReply}</Paragraph>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                </Col>
            </Row>
        </div>
    );
};

import { Space, Tag } from 'antd'; // Tách import

export default ProductReviews;
