'use client';

import React, { useState } from 'react';
import { Row, Col } from 'antd';
import Image from 'next/image';

interface ProductImageGalleryProps {
    images: string[];
    title: string;
}


export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <>
            
            <div className="pdp-main-image">
                <Image
                    src={selectedImage}
                    alt={title}
                    fill
                    style={{ objectFit: 'contain', padding: '24px' }}
                    priority
                />
            </div>

            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                {images.map((img, idx) => (
                    <Col span={6} key={idx}>
                        <div
                            onClick={() => setSelectedImage(img)}
                            className="pdp-thumbnail"
                            style={{
                                border: selectedImage === img
                                    ? '2px solid #1677ff'
                                    : '2px solid transparent',
                            }}
                        >
                            <Image
                                src={img}
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
