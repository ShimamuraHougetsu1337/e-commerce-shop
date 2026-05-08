'use client'
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Rate, Tooltip, Typography, message } from 'antd';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import QuickViewModal from './quick-view-modal';

const { Title, Text } = Typography;

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('ProductCard');
  const router = useRouter();
  const { data: session } = useSession();
  const { items, addItem, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [isCartLoading, setIsCartLoading] = useState<boolean>(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);


  const isLiked = items.some(item => item._id === product._id);



  const handleCardClick = () => {
    router.push(`/products/${product._id}`);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.accessToken) {
      message.warning(t('loginToCart'));
      return;
    }

    setIsCartLoading(true);
    try {
      await addToCart(product, 1, session.accessToken);
      message.success(t('addedToCart', { productName: product.name }));
    } catch (error) {
      message.error(t('errorCart'));
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.accessToken) {
      message.warning(t('loginToWishlist'));
      return;
    }

    try {
      setIsWishlistLoading(true);
      if (isLiked) {
        await removeItem(product._id, session.accessToken);
        message.success(t('removedFromWishlist'));
      } else {
        await addItem(product, session.accessToken);
        message.success(t('addedToWishlist'));
      }
    } catch (error) {
      message.error(t('errorWishlist'));
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <>
      <Card
        hoverable
        onClick={handleCardClick}
        style={{ borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        styles={{
          body: {
            padding: 20,
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        cover={
          <div suppressHydrationWarning style={{ height: 220, backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <Image
              alt={product.name ?? "Product image"}
              src={product.images && product.images.length > 0 ? (product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${product.images[0]}`) : "/no-image.png"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
              className="product-card-image"
            />
            
            <div className="product-card-actions" style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'all 0.3s ease'
            }}>
              <Tooltip title={isLiked ? t('removeFromWishlistTooltip') : t('addToWishlistTooltip')} placement="left">
                <Button
                  type="text"
                  shape="circle"
                  icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f', fontSize: 20 }} /> : <HeartOutlined style={{ fontSize: 20, color: '#aaa' }} />}
                  onClick={handleWishlistClick}
                  loading={isWishlistLoading}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Tooltip>

              <Tooltip title={t('quickViewTooltip')} placement="left">
                <Button
                  type="text"
                  shape="circle"
                  icon={<EyeOutlined style={{ fontSize: 20, color: '#1677ff' }} />}
                  onClick={handleQuickViewClick}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Tooltip>
            </div>
          </div>
        }
      >
        <div suppressHydrationWarning style={{ flex: 1 }}>
          <Flex align="center" gap="small" style={{ marginBottom: 8 }}>
            <Rate disabled defaultValue={product.averageRating || 0} style={{ fontSize: 14, color: '#faad14' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>({product.totalReviews || 0})</Text>
          </Flex>
          <Title level={5} style={{ margin: '0 0 16px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </Title>
        </div>

        <Flex align="center" justify="space-between" style={{ marginTop: 'auto' }}>
          <div>
            <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{product.price.toLocaleString('vi-VN')} đ</Text>
          </div>
          <Button
            type="primary"
            shape="circle"
            icon={<ShoppingCartOutlined />}
            size="large"
            loading={isCartLoading}
            style={{ backgroundColor: '#1677ff' }}
            onClick={handleCartClick}
          />
        </Flex>
      </Card>

      <QuickViewModal 
        product={product} 
        open={isQuickViewOpen} 
        onCancel={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}

