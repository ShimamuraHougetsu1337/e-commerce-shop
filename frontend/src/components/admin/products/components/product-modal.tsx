"use client";

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, InputNumber, Modal, Select, Space, Upload, message } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ProductModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: any;
    editingProduct: any;
    loading: boolean;
    imageUrl: string;
    setImageUrl: (url: string) => void;
    categories: { label: string, value: string }[];
    session: any;
}

export default function ProductModal({
    open,
    onOk,
    onCancel,
    form,
    editingProduct,
    loading,
    imageUrl,
    setImageUrl,
    categories,
    session
}: ProductModalProps) {
    const t = useTranslations('AdminProducts');
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.data?.fileName) {
                setImageUrl(data.data.fileName);
                form.setFieldValue('thumbnail', data.data.fileName);
                onSuccess("Ok");
                message.success(t('uploadSuccess'));
            } else {
                onError("Error");
                const errorMsg = data.message || (Array.isArray(data.message) ? data.message[0] : t('uploadFailed'));
                message.error(errorMsg);
            }
        } catch (error) {
            onError(error);
            message.error(t('serverError'));
        } finally {
            setUploading(false);
        }
    };

    const getImageUrl = (imageName: string) => {
        if (!imageName) return "/placeholder-product.png";
        if (imageName.startsWith('http')) return imageName;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${imageName}`;
    };

    return (
        <Modal
            title={editingProduct ? t('editProduct') : t('addProduct')}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ isActive: true }}
                style={{ marginTop: 20 }}
            >
                <Form.Item
                    name="name"
                    label={t('name')}
                    rules={[{ required: true, message: t('nameRequired') }]}
                >
                    <Input placeholder={t('name')} />
                </Form.Item>

                <Space size="large" style={{ display: 'flex', width: '100%' }}>
                    <Form.Item
                        name="price"
                        label={t('price')}
                        rules={[{ required: true, message: t('priceRequired') }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                    </Form.Item>

                    <Form.Item
                        name="stock_quantity"
                        label={t('stock')}
                        rules={[{ required: true, message: t('stockRequired') }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Space>

                <Space size="large" style={{ display: 'flex', width: '100%' }}>
                    <Form.Item
                        name="category_id"
                        label={t('category')}
                        rules={[{ required: true, message: t('categoryRequired') }]}
                        style={{ flex: 1 }}
                    >
                        <Select
                            placeholder={t('selectCategory')}
                            options={categories}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label={t('status')}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select options={[
                            { label: t('onSale'), value: true },
                            { label: t('stopSelling'), value: false },
                        ]} />
                    </Form.Item>
                </Space>

                <Form.Item
                    name="short_description"
                    label={t('shortDescription')}
                >
                    <Input.TextArea rows={3} placeholder={t('shortDescription')} />
                </Form.Item>

                <Form.Item
                    name="thumbnail"
                    label={t('thumbnail')}
                    rules={[{ required: true, message: t('thumbnailRequired') }]}
                >
                    <Space align="start" size="large">
                        <Upload
                            name="file"
                            listType="picture-card"
                            showUploadList={false}
                            customRequest={handleUpload}
                        >
                            {imageUrl ? (
                                <Image
                                    src={getImageUrl(imageUrl)}
                                    alt="avatar"
                                    style={{ width: '100%', borderRadius: 8 }}
                                    preview={false}
                                />
                            ) : (
                                <div>
                                    {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>{t('upload')}</div>
                                </div>
                            )}
                        </Upload>
                        {imageUrl && <Button type="link" onClick={() => { setImageUrl(''); form.setFieldValue('thumbnail', ''); }}>{t('remove')}</Button>}
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}
