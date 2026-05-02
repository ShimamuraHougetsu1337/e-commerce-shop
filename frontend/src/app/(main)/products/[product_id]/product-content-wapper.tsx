'use client';

import ProductActions from '@/components/product/product-actions';
import ProductDetailsTabs from '@/components/product/product-details-tabs';
import ProductImageGallery from '@/components/product/product-image-gallery';
import ProductInfo from '@/components/product/product-info';
import RelatedProductsCarousel from '@/components/product/related-products-carousel';
import { sendRequest } from '@/utils/api';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Divider, Layout, Row, Space } from 'antd';
import Link from 'next/link';
import { useCallback, useState } from 'react';

const { Content } = Layout;

interface ProductContentWrapperProps {
    product: IProduct;
    relatedProducts: IProduct[];
}

export default function ProductContentWrapper({ product: initialProduct, relatedProducts }: ProductContentWrapperProps) {
    const [product, setProduct] = useState(initialProduct);

    const refreshProductData = useCallback(async () => {
        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${initialProduct._id}`,
                method: "GET",
            });
            if (res && res.data) {
                setProduct(res.data);
            }
        } catch (error) {
            console.error('Refresh product data error:', error);
        }
    }, [initialProduct._id]);

    return (
        <Content>
            <div className="pdp-container">
                <Breadcrumb
                    separator=">"
                    className="pdp-breadcrumb"
                    items={[
                        {
                            title: (
                                <Link href="/">
                                    <Space size="small">
                                        <HomeOutlined />
                                        <span>Trang chủ</span>
                                    </Space>
                                </Link>
                            ),
                        },
                        {
                            title: <Link href="/products">Cửa hàng</Link>,
                        },
                        {
                            title: product.slug,
                        },
                    ]}
                />

                <Row gutter={[48, 24]}>
                    <Col xs={24} md={12}>
                        <ProductImageGallery
                            images={product.images}
                            title={product.slug}
                        />
                    </Col>

                    <Col xs={24} md={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <ProductInfo
                            name={product.name}
                            price={product.price}
                            rating={product.averageRating || 0}
                            reviewsCount={product.totalReviews || 0}
                            description={product.short_description}
                        />
                        <div style={{ marginTop: 'auto' }}>
                            <ProductActions product={product} />
                        </div>
                    </Col>
                </Row>

                <ProductDetailsTabs 
                    productId={product._id} 
                    description={product.long_description} 
                    onReviewSuccess={refreshProductData}
                />

                <Divider className="pdp-divider" />
                <RelatedProductsCarousel products={relatedProducts} />
            </div>
        </Content>
    );
}