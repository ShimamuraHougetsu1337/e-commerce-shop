'use client';

import { Button, Col, Row, Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface PromoSectionProps {
  products?: any[];
}

export default function PromoSection({ products }: PromoSectionProps) {
  const t = useTranslations('PromoSection');
  // Lấy 2 sản phẩm tiếp theo sau phần Hero (ví dụ index 3 và 4)
  const promo1 = products?.[3];
  const promo2 = products?.[4];

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <div style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            borderRadius: 20,
            padding: 32,
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <div style={{ maxWidth: '60%', zIndex: 1 }}>
              <Title level={4} style={{ margin: 0, color: '#0369a1', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>
                {t('specialOffer')}
              </Title>
              <Title level={2} style={{ marginTop: 8, marginBottom: 16, color: '#0c4a6e', fontSize: 24 }}>
                {promo1?.name || "Tai nghe Gaming Pro"}
              </Title>
              <Link href={promo1 ? `/products/${promo1._id}` : '#'}>
                <Button type="primary" style={{ backgroundColor: '#0ea5e9', borderRadius: 8 }}>
                  {t('buyNow')}
                </Button>
              </Link>
            </div>
            
            {promo1 && promo1.images?.length > 0 && (
              <div style={{ 
                position: 'absolute', 
                right: -20, 
                bottom: 20, 
                width: '50%', 
                height: 200,
              }}>
                <Image 
                  src={promo1.images[0].startsWith('http') ? promo1.images[0] : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${promo1.images[0]}`}
                  alt={promo1.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' 
                  }}
                />
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: 20,
            padding: 32,
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <div style={{ maxWidth: '60%', zIndex: 1 }}>
              <Title level={4} style={{ margin: 0, color: '#b45309', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>
                {t('newTrend')}
              </Title>
              <Title level={2} style={{ marginTop: 8, marginBottom: 16, color: '#78350f', fontSize: 24 }}>
                {promo2?.name || "Laptop Văn phòng Sáng tạo"}
              </Title>
              <Link href={promo2 ? `/products/${promo2._id}` : '#'}>
                <Button type="primary" style={{ backgroundColor: '#f59e0b', borderRadius: 8, border: 'none' }}>
                  {t('discover')}
                </Button>
              </Link>
            </div>

            {promo2 && promo2.images?.length > 0 && (
              <div style={{ 
                position: 'absolute', 
                right: -20, 
                bottom: 20, 
                width: '50%', 
                height: 200,
              }}>
                <Image 
                  src={promo2.images[0].startsWith('http') ? promo2.images[0] : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${promo2.images[0]}`}
                  alt={promo2.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' 
                  }}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
