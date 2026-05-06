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
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import useSWR from 'swr';

const { Content } = Layout;

interface ProductContentWrapperProps {
    product: IProduct;
    relatedProducts: IProduct[];
}

export default function ProductContentWrapper({ product: initialProduct, relatedProducts }: ProductContentWrapperProps) {
    const router = useRouter();

    const fetcher = async (url: string) => {
        const res = await sendRequest<IBackendRes<IProduct>>({
            url,
            method: "GET",
            nextOption: { cache: 'no-store' }
        });
        return res.data;
    };

    const { data: product, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${initialProduct._id}`,
        fetcher,
        {
            fallbackData: initialProduct,
            revalidateOnFocus: true,
            revalidateOnMount: true
        }
    );

    const refreshProductData = useCallback(async () => {
        await mutate();
    }, [mutate]);

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
                            title: product?.slug || initialProduct.slug,
                        },
                    ]}
                />

                <Row gutter={[48, 24]}>
                    <Col xs={24} md={12}>
                        <ProductImageGallery
                            images={product?.images || initialProduct.images}
                            title={product?.slug || initialProduct.slug}
                        />
                    </Col>

                    <Col xs={24} md={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <ProductInfo
                            name={product?.name || initialProduct.name}
                            price={product?.price || initialProduct.price}
                            rating={product?.averageRating || 0}
                            reviewsCount={product?.totalReviews || 0}
                            description={product?.short_description || initialProduct.short_description}
                            stock_quantity={product?.stock_quantity ?? initialProduct.stock_quantity}
                        />
                        <div style={{ marginTop: 'auto' }}>
                            <ProductActions product={product || initialProduct} />
                        </div>
                    </Col>
                </Row>

                <ProductDetailsTabs
                    productId={product?._id || initialProduct._id}
                    description={product?.long_description || initialProduct.long_description}
                    onReviewSuccess={refreshProductData}
                />

                <Divider className="pdp-divider" />
                <RelatedProductsCarousel products={relatedProducts} />
            </div>
        </Content>
    );
}