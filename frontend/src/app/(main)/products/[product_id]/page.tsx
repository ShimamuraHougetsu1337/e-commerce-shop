import { sendRequest } from '@/utils/api';
import { Button, Result } from 'antd';
import Link from 'next/link';
import ProductContentWrapper from './product-content-wapper';



export default async function ProductDetailPage({ params }: { params: { product_id: string } }) {
    const { product_id } = params;

    const res = await sendRequest<IBackendRes<IProduct>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${product_id}`,
        method: "GET",
    });

    const productData = res?.data;

    if (!productData) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px'
            }}>
                <Result
                    status="404"
                    title="Không tìm thấy sản phẩm"
                    subTitle="Xin lỗi, sản phẩm bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc ngừng kinh doanh."
                    extra={
                        <Link href="/">
                            <Button type="primary" size="large">
                                Quay lại trang chủ
                            </Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    const paramsObj = {
        current: 1,
        pageSize: 8,
        category: productData.category?._id || productData.category,
    };

    const queryStr = new URLSearchParams(paramsObj as any).toString();

    const relatedRes = await sendRequest<IBackendRes<IModelPaginate<IProduct>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products?${queryStr}&_id!=${product_id}`,
        method: "GET"
    });

    const relatedProducts = relatedRes?.data?.result ?? [];

    const product = {
        _id: productData._id,
        name: productData.name,
        slug: productData.slug,
        long_description: productData.long_description,
        short_description: productData.short_description,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        category: productData.category,
        images: productData.images,
        averageRating: productData.averageRating,
        totalReviews: productData.totalReviews,
    };

    return (
        <ProductContentWrapper product={product} relatedProducts={relatedProducts} />
    );
}