'use client';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Carousel, Flex, Space, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './product-card';

const { Title } = Typography;

interface RelatedProductsCarouselProps {
    products: IProduct[];
}

export default function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
    const t = useTranslations('RelatedProductsCarousel');
    const carouselRef = useRef<any>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeSlidesToShow, setActiveSlidesToShow] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width <= 480) setActiveSlidesToShow(1);
            else if (width <= 768) setActiveSlidesToShow(2);
            else if (width <= 1024) setActiveSlidesToShow(3);
            else setActiveSlidesToShow(4);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!products || products.length === 0) return null;

    const emptySlotsCount = Math.max(0, activeSlidesToShow - products.length);
    const emptySlots = Array.from({ length: emptySlotsCount });

    const isPrevDisabled = currentSlide === 0;
    const isNextDisabled = currentSlide >= products.length - activeSlidesToShow || products.length <= activeSlidesToShow;

    return (
        <div>
            <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
                <Title className="pdp-section-title" style={{ margin: 0 }}>
                    {t('relatedProducts')}
                </Title>
                <Space>
                    <Button
                        shape="circle"
                        icon={<LeftOutlined />}
                        onClick={() => carouselRef.current?.prev()}
                        disabled={isPrevDisabled}
                    />
                    <Button
                        shape="circle"
                        icon={<RightOutlined />}
                        onClick={() => carouselRef.current?.next()}
                        disabled={isNextDisabled}
                    />
                </Space>
            </Flex>

            <Carousel
                ref={carouselRef}
                key={products.length}
                dots={false}
                rtl={false}
                slidesToShow={4}
                slidesToScroll={1}
                draggable={true}
                swipe={true}
                swipeToSlide={true}
                infinite={false}
                beforeChange={(current, next) => setCurrentSlide(next)}
                responsive={[
                    { breakpoint: 1024, settings: { slidesToShow: 3 } },
                    { breakpoint: 768, settings: { slidesToShow: 2 } },
                    { breakpoint: 480, settings: { slidesToShow: 1 } },
                ]}
            >
                {products.map((product) => (
                    <div key={product._id}>
                        <div style={{ padding: '0 12px 24px 12px' }}>
                            <ProductCard product={product} />
                        </div>
                    </div>
                ))}

                {emptySlots.map((_, index) => (
                    <div key={`empty-${index}`}>
                        <div style={{ padding: '0 12px 24px 12px', height: '10px' }}>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
}