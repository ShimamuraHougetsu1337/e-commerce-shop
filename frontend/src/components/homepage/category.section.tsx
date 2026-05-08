'use client';

import { Carousel, Typography } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;


interface ICategory {
  _id: string;
  slug: string;
  name: string;
  thumbnail: string;
}

interface IProps {
  categoryList: ICategory[];
}

export default function CategorySection(props: IProps) {
  const { categoryList } = props;
  const router = useRouter();

  return (
    <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
      <Title level={2} style={{ marginBottom: 40, fontWeight: 'bold' }}>Top Categories</Title>

      <Carousel
        dots={false}
        draggable={true}
        swipeToSlide={true}
        slidesToShow={6}
        slidesToScroll={2}
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
          { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } },
          { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
        ]}
      >
        {categoryList.map((cat, idx) => (
          <div key={idx}>
            <div style={{ padding: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                onClick={() => router.push(`/products?category=${cat.slug}`)}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    backgroundColor: '#f0f2f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    margin: '0 auto',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', width: '60%', height: '60%' }}>
                    <Image
                      src={cat.thumbnail}
                      alt={cat.name}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <Text strong style={{ fontSize: 16 }}>{cat.name}</Text>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}