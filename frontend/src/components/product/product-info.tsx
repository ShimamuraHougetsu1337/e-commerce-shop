import { Divider, Flex, Rate, Typography } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface ProductInfoProps {
    name: string;
    price: number;
    rating: number;
    reviewsCount: number;
    description: string;
}


export default function ProductInfo({
    name,
    price,
    rating,
    reviewsCount,
    description,
}: ProductInfoProps) {
    return (
        <>
            <Title className="pdp-product-title" style={{ margin: 0, fontWeight: 600 }}>
                {name}
            </Title>

            <Flex align="center" gap="small" style={{ marginTop: '8px', marginBottom: '16px' }}>
                <Rate
                    disabled
                    defaultValue={rating}
                    allowHalf
                    style={{ fontSize: '14px', color: '#fadb14' }}
                />
                <Text type="secondary">({reviewsCount} Reviews)</Text>
            </Flex>

            <Flex align="baseline" gap="middle" style={{ marginBottom: '16px' }}>
                <Text strong className="pdp-price" style={{ color: '#f5222d' }}>
                    {price.toLocaleString('vi-VN')} đ
                </Text>
            </Flex>

            <Paragraph type="secondary" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {description}
            </Paragraph>

            <Divider style={{ margin: '16px 0' }} />
        </>
    );
}
