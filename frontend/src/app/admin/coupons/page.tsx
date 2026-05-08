"use client";

import { createCoupon, deleteCoupon, fetchCouponsList, updateCoupon } from '@/utils/admin.api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export default function CouponsAdminPage() {
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
            message.error("Lỗi khi tải danh sách mã giảm giá");
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
            message.success('Xóa thành công');
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            message.error('Có lỗi xảy ra');
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
                message.success('Cập nhật thành công');
            } else {
                const res = await createCoupon(formattedValues, session?.accessToken as string);
                if (res && res.statusCode !== 200 && res.statusCode !== 201) {
                    message.error(Array.isArray(res.message) ? res.message[0] : res.message);
                    return;
                }
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            loadData(pagination.current, pagination.pageSize, searchText);
        } catch (error: any) {
            message.error('Có lỗi xảy ra: ' + (error.message || ''));
        }
    };

    const columns = [
        { title: 'Mã', dataIndex: 'code', key: 'code', render: (text: string) => <strong>{text}</strong> },
        { title: 'Loại', dataIndex: 'discountType', key: 'discountType' },
        { title: 'Giá trị', dataIndex: 'discountValue', key: 'discountValue' },
        { title: 'Đơn tối thiểu', dataIndex: 'minOrderValue', key: 'minOrderValue' },
        { title: 'Đã dùng / Tối đa', key: 'usage', render: (_: any, record: ICoupon) => `${record.usedCount} / ${record.maxUsage}` },
        { title: 'Ngày hết hạn', dataIndex: 'expiryDate', key: 'expiryDate', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
        { 
            title: 'Trạng thái', 
            key: 'status', 
            render: (_: any, record: ICoupon) => {
                const isExpired = dayjs(record.expiryDate).isBefore(dayjs());
                const isOutOfUsage = record.usedCount >= record.maxUsage;
                
                if (!record.isActive) return <Tag color="error">Đã khóa</Tag>;
                if (isExpired) return <Tag color="warning">Hết hạn</Tag>;
                if (isOutOfUsage) return <Tag color="orange">Hết lượt</Tag>;
                return <Tag color="success">Hoạt động</Tag>;
            } 
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: ICoupon) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Mã giảm giá</h2>
                <Space>
                    <Input.Search placeholder="Tìm theo mã..." onSearch={handleSearch} allowClear />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mới</Button>
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
                title={editingCoupon ? "Sửa Mã giảm giá" : "Thêm Mã giảm giá"} 
                open={isModalVisible} 
                onOk={handleModalOk} 
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                        <Input style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
                        <Select options={[{ label: 'Phần trăm (%)', value: 'PERCENTAGE' }, { label: 'Số tiền cố định', value: 'FIXED' }]} />
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.discountType !== currentValues.discountType}
                    >
                        {({ getFieldValue }) => (
                            <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
                                <InputNumber 
                                    min={0} 
                                    max={getFieldValue('discountType') === 'PERCENTAGE' ? 100 : undefined} 
                                    style={{ width: '100%' }} 
                                />
                            </Form.Item>
                        )}
                    </Form.Item>
                    <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu" rules={[{ required: true, message: 'Vui lòng nhập giá trị tối thiểu' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="maxUsage" label="Số lượt sử dụng tối đa" rules={[{ required: true, message: 'Vui lòng nhập số lượt tối đa' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="expiryDate" label="Ngày hết hạn" rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    {editingCoupon && (
                        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
