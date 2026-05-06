import { Divider, Flex, Rate, Typography } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface ProductInfoProps {
    name: string;
    price: number;
    rating: number;
    reviewsCount: number;
    description: string;
    stock_quantity: number;
}


export default function ProductInfo({
    name,
    price,
    rating,
    reviewsCount,
    description,
    stock_quantity,
}: ProductInfoProps) {
    return (
        <>
            <Title className="pdp-product-title" style={{ margin: 0, fontWeight: 600 }}>
                {name}
            </Title>

            <Flex align="center" gap="small" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <Rate
                    disabled
                    defaultValue={rating}
                    allowHalf
                    style={{ fontSize: '14px', color: '#fadb14' }}
                />
                <Text type="secondary">({reviewsCount} Reviews)</Text>
            </Flex>

            <div style={{ marginBottom: '16px' }}>
                <Text 
                    strong 
                    style={{ 
                        color: stock_quantity > 0 ? '#52c41a' : '#ff4d4f',
                        fontSize: '14px',
                        backgroundColor: stock_quantity > 0 ? '#f6ffed' : '#fff1f0',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${stock_quantity > 0 ? '#b7eb8f' : '#ffa39e'}`
                    }}
                >
                    {stock_quantity > 0 
                        ? `Còn lại: ${stock_quantity} sản phẩm` 
                        : 'Hết hàng'}
                </Text>
            </div>

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
