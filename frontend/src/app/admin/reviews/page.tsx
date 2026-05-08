"use client";

import { adminDeleteReview, adminReplyReview, adminToggleHidden, fetchReviewsList } from '@/utils/admin.api';
import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, MessageOutlined, StarFilled } from '@ant-design/icons';
import { Avatar, Button, Input, message, Modal, Popconfirm, Rate, Space, Table, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AdminReviewsPage() {
    const t = useTranslations('AdminReviews');
    const { data: session } = useSession();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');

    // Reply modal
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [replyTarget, setReplyTarget] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    const loadData = useCallback(async (current = 1, pageSize = 10, query = '') => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetchReviewsList({ current, pageSize, query, accessToken: session.accessToken });
            if (res.data) {
                setData(res.data.result);
                setPagination({ current: res.data.meta.current, pageSize: res.data.meta.pageSize, total: res.data.meta.total });
            }
        } catch (error) {
            message.error(t('fetchError'));
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = (value: string) => {
        setSearchText(value);
        loadData(1, pagination.pageSize, value);
    };

    const handleTableChange = (newPagination: any) => {
        loadData(newPagination.current, newPagination.pageSize, searchText);
    };

    const handleToggleHidden = async (id: string) => {
        try {
            await adminToggleHidden(id, session?.accessToken as string);
            message.success(t('toggleSuccess'));
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            message.error(t('toggleError'));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminDeleteReview(id, session?.accessToken as string);
            message.success(t('deleteSuccess'));
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            message.error(t('deleteError'));
        }
    };

    const openReplyModal = (record: any) => {
        setReplyTarget(record);
        setReplyText(record.adminReply || '');
        setReplyModalOpen(true);
    };

    const handleReply = async () => {
        if (!replyTarget || !replyText.trim()) return;
        setReplyLoading(true);
        try {
            await adminReplyReview(replyTarget._id, replyText.trim(), session?.accessToken as string);
            message.success(t('replySuccess'));
            setReplyModalOpen(false);
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            message.error(t('replyError'));
        } finally {
            setReplyLoading(false);
        }
    };

    const columns = [
        {
            title: t('product'),
            key: 'product',
            width: 200,
            render: (_: any, record: any) => (
                <Space>
                    {record.productId?.images?.[0] && (
                        <Avatar shape="square" size={40} src={record.productId.images[0]} />
                    )}
                    <Text strong style={{ fontSize: 13 }}>{record.productId?.name || t('noProduct')}</Text>
                </Space>
            ),
        },
        {
            title: t('customer'),
            key: 'customer',
            width: 160,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.userId?.name || t('guest')}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{record.userId?.email}</Text>
                </Space>
            ),
        },
        {
            title: t('rating'),
            dataIndex: 'rating',
            key: 'rating',
            width: 140,
            align: 'center' as const,
            sorter: (a: any, b: any) => a.rating - b.rating,
            render: (rating: number) => (
                <Space>
                    {/* <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} /> */}
                    <Tag color={rating >= 4 ? 'green' : rating >= 3 ? 'orange' : 'red'}>
                        {rating}<StarFilled style={{ fontSize: 10, marginLeft: 2 }} />
                    </Tag>
                </Space>
            ),
        },
        {
            title: t('comment'),
            dataIndex: 'comment',
            key: 'comment',
            width: 250,
            render: (comment: string, record: any) => (
                <div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 13 }}>{comment}</Paragraph>
                    {record.adminReply && (
                        <div style={{ marginTop: 8, padding: '6px 10px', background: '#f0f9ff', borderRadius: 6, borderLeft: '3px solid #1677ff' }}>
                            <Text type="secondary" style={{ fontSize: 11 }}><MessageOutlined /> {t('shopReply')}</Text>
                            <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0, fontSize: 12, color: '#1677ff' }}>{record.adminReply}</Paragraph>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: t('status'),
            key: 'status',
            width: 100,
            align: 'center' as const,
            render: (_: any, record: any) => (
                record.isHidden
                    ? <Tag color="error">{t('hidden')}</Tag>
                    : <Tag color="success">{t('visible')}</Tag>
            ),
        },
        {
            title: t('date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            align: 'center' as const,
            render: (date: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format('DD/MM/YYYY')}</Text>,
        },
        {
            title: t('action'),
            key: 'action',
            width: 140,
            align: 'center' as const,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title={t('reply')}>
                        <Button type="text" icon={<MessageOutlined style={{ color: '#1677ff' }} />} onClick={() => openReplyModal(record)} />
                    </Tooltip>
                    <Tooltip title={record.isHidden ? t('show') : t('hide')}>
                        <Button
                            type="text"
                            icon={record.isHidden ? <EyeOutlined style={{ color: '#52c41a' }} /> : <EyeInvisibleOutlined style={{ color: '#faad14' }} />}
                            onClick={() => handleToggleHidden(record._id)}
                        />
                    </Tooltip>
                    <Popconfirm title={t('deleteConfirm')} onConfirm={() => handleDelete(record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>{t('manageReviews')}</h2>
                <Space>
                    <Input.Search placeholder={t('searchPlaceholder')} onSearch={handleSearch} allowClear />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 1100 }}
                rowClassName={(record) => record.isHidden ? 'review-hidden-row' : ''}
            />

            <Modal
                title={t('replyTitle')}
                open={replyModalOpen}
                onCancel={() => setReplyModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setReplyModalOpen(false)}>{t('cancel')}</Button>,
                    <Button key="send" type="primary" loading={replyLoading} onClick={handleReply} icon={<MessageOutlined />}>
                        {t('sendReply')}
                    </Button>
                ]}
            >
                {replyTarget && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                            <Space>
                                <Avatar size={32} src={replyTarget.userId?.avatar}>{replyTarget.userId?.name?.[0]}</Avatar>
                                <div>
                                    <Text strong>{replyTarget.userId?.name}</Text>
                                    <div><Rate disabled defaultValue={replyTarget.rating} style={{ fontSize: 12 }} /></div>
                                </div>
                            </Space>
                            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{replyTarget.comment}</Paragraph>
                        </div>

                        <TextArea
                            rows={4}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('replyPlaceholder')}
                            maxLength={500}
                            showCount
                        />
                    </div>
                )}
            </Modal>

            <style jsx global>{`
                .review-hidden-row {
                    opacity: 0.5;
                    background: #fafafa !important;
                }
            `}</style>
        </div>
    );
}
