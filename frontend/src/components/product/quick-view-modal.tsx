'use client';

import { Modal, Row, Col } from 'antd';
import Image from 'next/image';
import ProductInfo from './product-info';
import ProductActions from './product-actions';

interface QuickViewModalProps {
    product: IProduct | null;
    open: boolean;
    onCancel: () => void;
}

export default function QuickViewModal({ product, open, onCancel }: QuickViewModalProps) {
    if (!product) return null;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1000}
            centered
            styles={{
                body: {
                    padding: '24px',
                }
            }}
        >
            <Row gutter={[32, 32]} align="middle">
                <Col xs={24} md={12}>
                    <div style={{ 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px'
                    }}>
                        <div style={{ position: 'relative', width: '100%', height: 450 }}>
                            <Image
                                alt={product.name}
                                src={product.images && product.images.length > 0 
                                    ? (product.images[0].startsWith('http') 
                                        ? product.images[0] 
                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${product.images[0]}`) 
                                    : "/no-image.png"}
                                fill
                                style={{ 
                                    objectFit: 'contain' 
                                }}
                            />
                        </div>
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <ProductInfo
                        name={product.name}
                        price={product.price}
                        rating={product.averageRating}
                        reviewsCount={product.totalReviews}
                        description={product.short_description || product.long_description?.substring(0, 150) + '...'}
                        stock_quantity={product.stock_quantity}
                    />
                    <div style={{ marginTop: '24px' }}>
                        <ProductActions product={product} />
                    </div>
                </Col>
            </Row>
        </Modal>
    );
}
