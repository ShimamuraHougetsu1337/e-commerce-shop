'use client';

import { Col, Row } from 'antd';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductImageGalleryProps {
    images: string[];
    title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selected image when images list changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [images]);

    const getImageUrl = (img: string) => {
        if (!img) return '/no-image.png';
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${img}`;
    };

    const activeImage = images && images.length > 0 ? images[selectedIndex] || images[0] : '';

    return (
        <>
            <div className="pdp-main-image">
                <Image
                    src={getImageUrl(activeImage)}
                    alt={title}
                    fill
                    style={{ objectFit: 'contain', padding: '24px' }}
                    priority
                />
            </div>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                {images && images.map((img, idx) => (
                    <Col span={6} key={idx}>
                        <div
                            onClick={() => setSelectedIndex(idx)}
                            className="pdp-thumbnail"
                            style={{
                                border: selectedIndex === idx
                                    ? '2px solid #1677ff'
                                    : '2px solid transparent',
                            }}
                        >
                            <Image
                                src={getImageUrl(img)}
                                alt={`thumbnail-${idx}`}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
}
