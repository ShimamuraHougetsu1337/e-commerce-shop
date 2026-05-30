"use client";

import { PlusOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Modal, Select, Upload, message, Row, Col } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

interface ProductModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: any;
    editingProduct: any;
    loading: boolean;
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
    categories,
    session
}: ProductModalProps) {
    const t = useTranslations('AdminProducts');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const getImageUrl = (imageName: string) => {
        if (!imageName) return "/placeholder-product.png";
        if (imageName.startsWith('http')) return imageName;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${imageName}`;
    };

    useEffect(() => {
        if (open) {
            if (editingProduct && editingProduct.images && editingProduct.images.length > 0) {
                const formattedFiles = editingProduct.images.map((img: string, index: number) => ({
                    uid: `-${index}`,
                    name: img,
                    status: 'done',
                    url: getImageUrl(img),
                    response: img,
                }));
                setFileList(formattedFiles);
                form.setFieldValue('images', editingProduct.images);
            } else {
                setFileList([]);
                form.setFieldValue('images', []);
            }
        }
    }, [open, editingProduct, form]);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

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
                onSuccess(data.data.fileName);
                message.success(t('uploadSuccess') || 'Tải ảnh lên thành công');
            } else {
                onError(new Error('Upload failed'));
                const errorMsg = data.message || (Array.isArray(data.message) ? data.message[0] : t('uploadFailed'));
                message.error(errorMsg || 'Tải ảnh lên thất bại');
            }
        } catch (error) {
            onError(error);
            message.error(t('serverError') || 'Có lỗi kết nối máy chủ');
        }
    };

    const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        const updatedList = newFileList.map((file) => {
            if (file.status === 'done' && file.response) {
                const fileName = typeof file.response === 'string' ? file.response : file.response.data?.fileName || file.name;
                return {
                    ...file,
                    url: getImageUrl(fileName),
                    response: fileName
                };
            }
            return file;
        });

        setFileList(updatedList);

        const uploadedImages = updatedList
            .filter((f) => f.status === 'done')
            .map((f) => {
                if (typeof f.response === 'string') return f.response;
                if (f.response && f.response.data?.fileName) return f.response.data.fileName;
                return f.name;
            });

        form.setFieldValue('images', uploadedImages);
        form.validateFields(['images']);
    };

    const handlePreview = async (file: UploadFile) => {
        setPreviewImage(file.url || file.preview || '');
        setPreviewOpen(true);
        setPreviewTitle(file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : 'Preview'));
    };

    return (
        <Modal
            title={
                <div style={{ fontSize: 18, fontWeight: 600, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                    {editingProduct ? t('editProduct') : t('addProduct')}
                </div>
            }
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={850}
            destroyOnClose
            style={{ top: 40 }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ isActive: true }}
                style={{ marginTop: 20 }}
            >
                <Row gutter={24}>
                    {/* Left Column - Product details */}
                    <Col span={14}>
                        <div style={{ paddingRight: 8 }}>
                            <Form.Item
                                name="name"
                                label={<span style={{ fontWeight: 500 }}>{t('name')}</span>}
                                rules={[{ required: true, message: t('nameRequired') }]}
                            >
                                <Input placeholder={t('name')} style={{ borderRadius: 6 }} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="price"
                                        label={<span style={{ fontWeight: 500 }}>{t('price')}</span>}
                                        rules={[{ required: true, message: t('priceRequired') }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%', borderRadius: 6 }}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                            addonAfter="đ"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="stock_quantity"
                                        label={<span style={{ fontWeight: 500 }}>{t('stock')}</span>}
                                        rules={[{ required: true, message: t('stockRequired') }]}
                                    >
                                        <InputNumber style={{ width: '100%', borderRadius: 6 }} min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="category_id"
                                        label={<span style={{ fontWeight: 500 }}>{t('category')}</span>}
                                        rules={[{ required: true, message: t('categoryRequired') }]}
                                    >
                                        <Select
                                            placeholder={t('selectCategory')}
                                            options={categories}
                                            style={{ borderRadius: 6 }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="isActive"
                                        label={<span style={{ fontWeight: 500 }}>{t('status')}</span>}
                                        rules={[{ required: true }]}
                                    >
                                        <Select
                                            style={{ borderRadius: 6 }}
                                            options={[
                                                { label: t('onSale'), value: true },
                                                { label: t('stopSelling'), value: false },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="short_description"
                                label={<span style={{ fontWeight: 500 }}>{t('shortDescription')}</span>}
                            >
                                <Input.TextArea rows={4} placeholder={t('shortDescription')} style={{ borderRadius: 6 }} />
                            </Form.Item>
                        </div>
                    </Col>

                    {/* Right Column - Product images upload zone */}
                    <Col span={10}>
                        <div style={{
                            border: '1px dashed #d9d9d9',
                            borderRadius: 8,
                            padding: 20,
                            background: '#fafafa',
                            minHeight: '380px',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}>
                            <Form.Item
                                name="images"
                                label={<span style={{ fontWeight: 600, fontSize: 14 }}>{t('productImage')}</span>}
                                rules={[{ required: true, message: t('thumbnailRequired') || 'Vui lòng tải lên ít nhất 1 ảnh' }]}
                            >
                                <div style={{ marginTop: 8 }}>
                                    <Upload
                                        name="file"
                                        listType="picture-card"
                                        fileList={fileList}
                                        customRequest={handleUpload}
                                        onChange={handleUploadChange}
                                        onPreview={handlePreview}
                                        multiple={true}
                                    >
                                        {fileList.length >= 8 ? null : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <PlusOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                                                <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{t('upload') || 'Tải lên'}</div>
                                            </div>
                                        )}
                                    </Upload>
                                </div>
                            </Form.Item>
                            <div style={{ marginTop: 'auto', fontSize: 12, color: '#8c8c8c', lineHeight: '1.6', background: '#fff', padding: '10px 14px', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                <div style={{ fontWeight: 500, color: '#595959', marginBottom: 4 }}>💡 Lưu ý:</div>
                                • Bạn có thể tải lên tối đa 8 hình ảnh.<br />
                                • Kéo thả để sắp xếp hoặc tải nhiều file cùng lúc.<br />
                                • Ảnh đầu tiên (góc trên trái) sẽ là **ảnh đại diện** (thumbnail) hiển thị ngoài cửa hàng.
                            </div>
                        </div>
                    </Col>
                </Row>
            </Form>

            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                destroyOnClose
            >
                <img alt={previewTitle} style={{ width: '100%', borderRadius: 8 }} src={previewImage} />
            </Modal>
        </Modal>
    );
}
