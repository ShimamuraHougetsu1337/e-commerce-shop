"use client";

import { createCoupon, deleteCoupon, fetchCouponsList, updateCoupon } from '@/utils/admin.api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function CouponsAdminPage() {
    const t = useTranslations('AdminCoupons');
    const { data: session } = useSession();
    const [data, setData] = useState<ICoupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
    const [form] = Form.useForm();

    const loadData = useCallback(async (current = 1, pageSize = 10, query = '') => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetchCouponsList({ current, pageSize, query, accessToken: session.accessToken });
            if (res.data) {
                setData(res.data.result);
                setPagination({ current: res.data.meta.current, pageSize: res.data.meta.pageSize, total: res.data.meta.total });
            }
        } catch (error) {
            message.error(t('fetchError'));
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

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

    const handleDelete = async (id: string) => {
        try {
            await deleteCoupon(id, session?.accessToken as string);
            message.success(t('deleteSuccess'));
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            message.error(t('errorOccurred'));
        }
    };

    const showModal = (coupon?: ICoupon) => {
        setEditingCoupon(coupon || null);
        if (coupon) {
            form.setFieldsValue({
                ...coupon,
                expiryDate: dayjs(coupon.expiryDate)
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                expiryDate: values.expiryDate.toISOString()
            };

            if (editingCoupon) {
                const res = await updateCoupon(editingCoupon._id, formattedValues, session?.accessToken as string);
                if (res && res.statusCode !== 200 && res.statusCode !== 201) {
                    message.error(Array.isArray(res.message) ? res.message[0] : res.message);
                    return;
                }
                message.success(t('updateSuccess'));
            } else {
                const res = await createCoupon(formattedValues, session?.accessToken as string);
                if (res && res.statusCode !== 200 && res.statusCode !== 201) {
                    message.error(Array.isArray(res.message) ? res.message[0] : res.message);
                    return;
                }
                message.success(t('addSuccess'));
            }
            setIsModalVisible(false);
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error: any) {
            message.error(t('errorOccurred') + ': ' + (error.message || ''));
        }
    };

    const columns = [
        { title: t('code'), dataIndex: 'code', key: 'code', render: (text: string) => <strong>{text}</strong> },
        { title: t('type'), dataIndex: 'discountType', key: 'discountType' },
        { title: t('value'), dataIndex: 'discountValue', key: 'discountValue' },
        { title: t('minOrder'), dataIndex: 'minOrderValue', key: 'minOrderValue' },
        { title: t('usage'), key: 'usage', render: (_: any, record: ICoupon) => `${record.usedCount} / ${record.maxUsage}` },
        { title: t('expiryDate'), dataIndex: 'expiryDate', key: 'expiryDate', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
        { 
            title: t('status'), 
            key: 'status', 
            render: (_: any, record: ICoupon) => {
                const isExpired = dayjs(record.expiryDate).isBefore(dayjs());
                const isOutOfUsage = record.usedCount >= record.maxUsage;
                
                if (!record.isActive) return <Tag color="error">{t('locked')}</Tag>;
                if (isExpired) return <Tag color="warning">{t('expired')}</Tag>;
                if (isOutOfUsage) return <Tag color="orange">{t('outOfUsage')}</Tag>;
                return <Tag color="success">{t('active')}</Tag>;
            } 
        },
        {
            title: t('action'),
            key: 'action',
            render: (_: any, record: ICoupon) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
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
                <h2>{t('manageCoupons')}</h2>
                <Space>
                    <Input.Search placeholder={t('searchPlaceholder')} onSearch={handleSearch} allowClear />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>{t('addNew')}</Button>
                </Space>
            </div>

            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="_id" 
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <Modal 
                title={editingCoupon ? t('editCoupon') : t('addCoupon')} 
                open={isModalVisible} 
                onOk={handleModalOk} 
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label={t('couponCode')} rules={[{ required: true, message: t('codeRequired') }]}>
                        <Input style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    <Form.Item name="discountType" label={t('discountType')} rules={[{ required: true, message: t('typeRequired') }]}>
                        <Select options={[{ label: t('percentage'), value: 'PERCENTAGE' }, { label: t('fixed'), value: 'FIXED' }]} />
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.discountType !== currentValues.discountType}
                    >
                        {({ getFieldValue }) => (
                            <Form.Item name="discountValue" label={t('discountValue')} rules={[{ required: true, message: t('valueRequired') }]}>
                                <InputNumber 
                                    min={0} 
                                    max={getFieldValue('discountType') === 'PERCENTAGE' ? 100 : undefined} 
                                    style={{ width: '100%' }} 
                                />
                            </Form.Item>
                        )}
                    </Form.Item>
                    <Form.Item name="minOrderValue" label={t('minOrderValue')} rules={[{ required: true, message: t('minOrderRequired') }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="maxUsage" label={t('maxUsage')} rules={[{ required: true, message: t('maxUsageRequired') }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="expiryDate" label={t('expiryDateLabel')} rules={[{ required: true, message: t('expiryDateRequired') }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    {editingCoupon && (
                        <Form.Item name="isActive" label={t('status')} valuePropName="checked">
                            <Switch checkedChildren={t('active')} unCheckedChildren={t('lock')} />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
