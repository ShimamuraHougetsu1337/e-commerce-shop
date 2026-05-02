'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Flex, Rate, Form, Input, Button, List, Avatar, Typography, App, Spin, Empty, Row, Col, Card } from 'antd';
import { UserOutlined, MessageOutlined, EditOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { getReviewsByProductApi, createReviewApi, updateReviewApi } from '@/utils/user.api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ProductReviewsProps {
    productId: string;
    onReviewSuccess?: () => void;
}

const ProductReviews = ({ productId, onReviewSuccess }: ProductReviewsProps) => {
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
            message.warning('Vui lòng đăng nhập để thực hiện');
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
                message.success(userReview ? 'Đã cập nhật đánh giá!' : 'Đã gửi đánh giá của bạn!');
                fetchReviews(1);
                if (onReviewSuccess) onReviewSuccess();
            } else {
                message.error(res?.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi gửi dữ liệu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '24px 0' }}>
            <Row gutter={[48, 32]}>
                {/* Review Form */}
                <Col xs={24} lg={10}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <Title level={4} style={{ marginBottom: 20 }}>
                            {userReview ? 'Cập nhật đánh giá của bạn' : 'Viết đánh giá của bạn'}
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
                                    label="Số sao đánh giá" 
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn số sao' },
                                        { type: 'number', min: 1, message: 'Vui lòng chọn ít nhất 1 sao' }
                                    ]}
                                >
                                    <Rate style={{ fontSize: 28 }} />
                                </Form.Item>
                                
                                <Form.Item 
                                    name="comment" 
                                    label="Nhận xét của bạn" 
                                    rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
                                >
                                    <TextArea 
                                        rows={4} 
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." 
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
                                    {userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá ngay'}
                                </Button>
                                {userReview && (
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginTop: 12 }}>
                                        Bạn đã đánh giá sản phẩm này. Bạn có thể chỉnh sửa nội dung bên trên.
                                    </Text>
                                )}
                            </Form>
                        </Card>
                    </div>
                </Col>

                {/* Reviews List */}
                <Col xs={24} lg={14}>
                    <Title level={4} style={{ marginBottom: 20 }}>
                        Tất cả đánh giá ({meta.total})
                    </Title>
                    
                    {loading && reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                    ) : reviews.length === 0 ? (
                        <Empty description="Chưa có đánh giá nào cho sản phẩm này" />
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
                                                        {isOwnReview && <Tag color="blue">Đánh giá của bạn</Tag>}
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
