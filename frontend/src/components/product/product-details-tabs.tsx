import { Tabs, Typography } from 'antd';
import { useTranslations } from 'next-intl';

import ProductReviews from './product-reviews';

const { Title, Paragraph } = Typography;

interface ProductDetailsTabsProps {
    productId: string;
    description: string;
    onReviewSuccess?: () => void;
}

export default function ProductDetailsTabs({ productId, description, onReviewSuccess }: ProductDetailsTabsProps) {
    const t = useTranslations('ProductDetailsTabs');
    const tabItems = [
        {
            key: '1',
            label: t('description'),
            children: (
                <div style={{ padding: '24px 0' }}>
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                </div>
            ),
        },
        {
            key: '2',
            label: t('reviews'),
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
