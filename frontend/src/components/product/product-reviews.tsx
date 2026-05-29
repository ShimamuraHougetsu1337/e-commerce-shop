'use client';

import { createReviewApi, deleteReviewApi, getReviewsByProductApi, updateReviewApi, getMyReviewsApi, getAvatarUrl } from '@/utils/user.api';
import { DeleteOutlined, EditOutlined, MessageOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Card, Col, Empty, Flex, Form, Input, List, Popconfirm, Rate, Row, Spin, Typography, Space, Tag, Modal } from 'antd';
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
    const [editForm] = Form.useForm();
    
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState({ current: 1, pageSize: 5, total: 0 });
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingReview, setEditingReview] = useState<any>(null);

    const fetchReviews = useCallback(async (current = 1) => {
        setLoading(true);
        try {
            const res = await getReviewsByProductApi(productId, current, meta.pageSize);
            let displayReviews: any[] = [];
            
            if (res && res.data) {
                displayReviews = res.data.result;
                setMeta(res.data.meta);
            }
            
            // Nếu đã đăng nhập, lấy thêm các review của user để gộp vào (trường hợp Pending/Rejected)
            if (session?.accessToken) {
                const myReviewsRes = await getMyReviewsApi(session.accessToken);
                if (myReviewsRes && myReviewsRes.data) {
                    const myReviewsForProduct = myReviewsRes.data.filter((r: any) => 
                        r.productId?._id === productId || r.productId === productId
                    );
                    
                    // Thêm những review của mình mà chưa có trong danh sách hiển thị (vì bị ẩn)
                    myReviewsForProduct.forEach((myReview: any) => {
                        const exists = displayReviews.find(r => String(r._id) === String(myReview._id));
                        if (!exists) {
                            // Đẩy lên đầu danh sách
                            displayReviews.unshift(myReview);
                        } else {
                            // Cập nhật lại status nếu có trong list
                            const index = displayReviews.findIndex(r => String(r._id) === String(myReview._id));
                            displayReviews[index] = { ...displayReviews[index], status: myReview.status, moderationReason: myReview.moderationReason };
                        }
                    });
                }
            }
            setReviews(displayReviews);
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setLoading(false);
        }
    }, [productId, meta.pageSize, session]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Handle Create New Review
    const onFinish = async (values: any) => {
        if (!session?.accessToken) {
            message.warning(t('loginRequired'));
            return;
        }

        setSubmitting(true);
        try {
            const res = await createReviewApi({
                productId,
                rating: values.rating,
                comment: values.comment
            }, session.accessToken);

            if (res && (res.statusCode === 201 || res.statusCode === 200)) {
                const updatedReview = res.data;
                
                if (updatedReview?.status === 'PENDING_MODERATION') {
                    message.success(t('reviewPending', { defaultValue: 'Đánh giá của bạn đã được gửi và đang chờ duyệt.' }));
                } else {
                    message.success(t('reviewSubmitted'));
                }

                form.resetFields();
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

    // Handle Edit Review
    const openEditModal = (review: any) => {
        setEditingReview(review);
        editForm.setFieldsValue({
            rating: review.rating,
            comment: review.comment
        });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values: any) => {
        if (!session?.accessToken || !editingReview) return;
        setSubmitting(true);
        try {
            const res = await updateReviewApi(editingReview._id, {
                rating: values.rating,
                comment: values.comment
            }, session.accessToken);

            if (res && (res.statusCode === 201 || res.statusCode === 200)) {
                const updatedReview = res.data;
                
                if (updatedReview?.status === 'PENDING_MODERATION') {
                    message.success(t('reviewPending', { defaultValue: 'Đánh giá đã được cập nhật và đang chờ duyệt lại.' }));
                } else {
                    message.success(t('reviewUpdated'));
                }
                
                setIsEditModalVisible(false);
                setEditingReview(null);
                fetchReviews(meta.current);
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

    // Handle Delete Review
    const onDelete = async (reviewId: string) => {
        if (!session?.accessToken) return;
        try {
            const res = await deleteReviewApi(reviewId, session.accessToken);
            if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                message.success(t('deleteSuccess'));
                fetchReviews(meta.current);
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
                {/* Review Create Form */}
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <Title level={4} style={{ marginBottom: 20 }}>
                            {t('writeYourReview')}
                        </Title>
                        <Card 
                            bordered={false} 
                            style={{ 
                                background: '#f8fafc', 
                                borderRadius: 16,
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
                                    type="primary"
                                    htmlType="submit" 
                                    block 
                                    size="large"
                                    loading={submitting}
                                    icon={<MessageOutlined />}
                                    style={{ 
                                        height: 48, 
                                        borderRadius: 12, 
                                        marginTop: 8,
                                    }}
                                >
                                    {t('submitReviewBtn')}
                                </Button>
                            </Form>
                        </Card>
                    </div>
                </Col>

                {/* Reviews List */}
                <Col xs={24} lg={16}>
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
                                const isOwnReview = session?.user?.email && (item.userId?.email === session.user.email || item.userId === (session.user as any).id || item.userId?._id === (session.user as any).id || item.userId?._id === (session.user as any)._id);
                                
                                return (
                                    <List.Item 
                                        style={{ 
                                            padding: '24px 16px', 
                                            borderBottom: '1px solid #f1f5f9',
                                            background: isOwnReview ? '#f0f9ff40' : 'transparent',
                                            borderRadius: isOwnReview ? 12 : 0,
                                            marginBottom: 12
                                        }}
                                        actions={isOwnReview ? [
                                            <Button key="edit" type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(item)}>
                                                Sửa
                                            </Button>,
                                            <Popconfirm key="delete" title={t('deleteConfirm')} onConfirm={() => onDelete(item._id)}>
                                                <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                                                    Xóa
                                                </Button>
                                            </Popconfirm>
                                        ] : []}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar size={48} icon={<UserOutlined />} src={getAvatarUrl(item.userId?.avatar)} />}
                                            title={
                                                <Flex justify="space-between" align="center">
                                                    <Space>
                                                        <Text strong style={{ fontSize: 15 }}>{item.userId?.name || 'Bạn'}</Text>
                                                        {isOwnReview && <Tag color="blue">{t('yourReviewTag', { defaultValue: 'Của bạn' })}</Tag>}
                                                        {item.status === 'PENDING_MODERATION' && <Tag color="warning">Đang chờ duyệt</Tag>}
                                                        {item.status === 'REJECTED' && <Tag color="error">Bị từ chối</Tag>}
                                                    </Space>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                    </Text>
                                                </Flex>
                                            }
                                            description={
                                                <div style={{ marginTop: 8 }}>
                                                    <Rate disabled value={item.rating} style={{ fontSize: 14 }} />
                                                    <Paragraph style={{ marginTop: 12, color: '#4b5563', lineHeight: 1.6, fontSize: 15 }}>
                                                        {item.comment}
                                                    </Paragraph>
                                                    
                                                    {isOwnReview && item.status === 'REJECTED' && (
                                                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, borderLeft: '4px solid #ef4444' }}>
                                                            <Text strong type="danger" style={{ fontSize: 13 }}>Lý do từ chối:</Text>
                                                            <Paragraph style={{ margin: 0, fontSize: 13, color: '#991b1b', marginTop: 4 }}>
                                                                Đánh giá chứa từ ngữ nhạy cảm hoặc không phù hợp với tiêu chuẩn cộng đồng. Vui lòng chỉnh sửa lại nội dung.
                                                            </Paragraph>
                                                        </div>
                                                    )}

                                                    {item.adminReply && (
                                                        <div style={{ marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #64748b' }}>
                                                            <Space size={4} style={{ marginBottom: 8 }}>
                                                                <ShopOutlined style={{ color: '#475569', fontSize: 14 }} />
                                                                <Text strong style={{ fontSize: 13, color: '#475569' }}>{t('shopReply', { defaultValue: 'Phản hồi từ người bán' })}</Text>
                                                            </Space>
                                                            <Paragraph style={{ margin: 0, fontSize: 14, color: '#334155' }}>{item.adminReply}</Paragraph>
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

            {/* Modal Sửa Đánh Giá */}
            <Modal
                title="Sửa đánh giá của bạn"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingReview(null);
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    style={{ marginTop: 20 }}
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

                    <Flex justify="end" gap={8} style={{ marginTop: 24 }}>
                        <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            Lưu thay đổi
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductReviews;
