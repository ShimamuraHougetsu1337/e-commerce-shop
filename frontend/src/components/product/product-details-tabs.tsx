import { Tabs, Typography } from 'antd';

import ProductReviews from './product-reviews';

const { Title, Paragraph } = Typography;

interface ProductDetailsTabsProps {
    productId: string;
    description: string;
    onReviewSuccess?: () => void;
}

export default function ProductDetailsTabs({ productId, description, onReviewSuccess }: ProductDetailsTabsProps) {
    const tabItems = [
        {
            key: '1',
            label: 'Mô tả',
            children: (
                <div style={{ padding: '24px 0' }}>
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                </div>
            ),
        },
        {
            key: '2',
            label: 'Đánh giá',
            children: (
                <ProductReviews productId={productId} onReviewSuccess={onReviewSuccess} />
            ),
        },
    ];

    return (
        <div className="pdp-tabs-section">
            <Tabs defaultActiveKey="1" size="large" items={tabItems} />
        </div>
    );
}
