'use client';

import { Button, Carousel, Col, Row, Typography } from 'antd';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

interface HeroBannerProps {
  products?: any[];
}

export default function HeroBanner({ products }: HeroBannerProps) {
  // Nếu không có sản phẩm truyền vào, hiển thị banner mặc định
  const displayProducts = products && products.length > 0 ? products.slice(0, 3) : null;

  if (!displayProducts) {
    return (
      <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(to right, #1a365d, #2d3748)',
            padding: 'clamp(40px, 8vw, 60px) clamp(24px, 5vw, 48px)',
            color: '#fff',
            borderRadius: 16,
            minHeight: 'clamp(350px, 50vh, 400px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Title style={{ color: '#fff' }}>Chào mừng đến với cửa hàng của chúng tôi</Title>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 1200, margin: '0 auto' }}>
      <Carousel autoplay effect="fade">
        {displayProducts.map((product) => (
          <div key={product._id} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: 'clamp(40px, 8vw, 60px) clamp(24px, 5vw, 48px)',
              color: '#1f2937',
              borderRadius: 16,
              minHeight: 'clamp(350px, 50vh, 400px)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Row align="middle" style={{ width: '100%' }} gutter={[32, 32]}>
                <Col xs={24} md={12} style={{ textAlign: 'left' }}>
                  <div style={{
                    backgroundColor: '#1677ff',
                    color: '#fff',
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 16
                  }}>
                    SẢN PHẨM MỚI
                  </div>
                  <Title level={1} style={{
                    color: '#111827',
                    fontSize: 'clamp(28px, 4vw, 42px)',
                    marginBottom: 16,
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </Title>
                  <Paragraph style={{
                    color: '#4b5563',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    maxWidth: 450,
                    marginBottom: 32,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.short_description}
                  </Paragraph>
                  <div style={{ marginBottom: 32 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                      {product.price?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <Link href={`/products/${product._id}`}>
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        borderRadius: 8,
                        padding: '0 40px',
                        height: 52,
                        fontWeight: 600,
                        boxShadow: '0 10px 15px -3px rgba(22, 119, 255, 0.3)'
                      }}
                    >
                      Khám phá ngay
                    </Button>
                  </Link>
                </Col>

                <Col xs={24} md={12} style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: 400,
                    aspectRatio: '1 / 1',
                    margin: '0 auto',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${product.images[0]}`}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: 350,
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))'
                        }}
                      />
                    ) : (
                      <div style={{ width: 200, height: 200, backgroundColor: '#ddd', borderRadius: '50%' }}></div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}