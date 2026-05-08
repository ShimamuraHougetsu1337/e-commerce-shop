'use client'
import { Button, Col, Flex, Row, Typography } from 'antd';

import ProductCard from '@/components/product/product-card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

interface ProductSectionProps {
  title: string,
  productList?: IProduct[],
  viewAllHref?: string
}


export default function ProductSection({ title, productList, viewAllHref }: ProductSectionProps) {
  const t = useTranslations('ProductSection');

  return (
    <div style={{ padding: '0 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 'bold' }}>{title}</Title>
        {viewAllHref ? (
          <Link href={viewAllHref}>
            <Button type="link" size="large" style={{ fontWeight: 600 }}>{t('viewAll')} {'>'}</Button>
          </Link>
        ) : (
          <Button type="link" size="large" style={{ fontWeight: 600 }}>{t('viewAll')} {'>'}</Button>
        )}
      </Flex>

      <Row gutter={[24, 24]}>
        {productList ? (
          productList.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Typography.Text type="secondary">{t('noData')}</Typography.Text>
          </Col>
        )}
      </Row>
    </div>
  );
}

