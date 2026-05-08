import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input, Flex, Typography, Image } from 'antd';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef } from 'react';
import { fetchProductsPagination } from '@/utils/auth.api';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

// Custom debounce function
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default function SearchAutocomplete() {
    const t = useTranslations('Common');
    const [options, setOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
    const router = useRouter();
    const searchRef = useRef<any>(null);

    const handleSearch = useCallback(
        debounce(async (value: string) => {
            if (!value || value.length < 2) {
                setOptions([]);
                return;
            }

            try {
                const res = await fetchProductsPagination({
                    current: 1,
                    pageSize: 5,
                    name: value
                });

                if (res && res.data) {
                    const searchOptions = res.data.result.map((product: IProduct) => ({
                        value: product.name,
                        label: (
                            <Flex align="center" gap="small" style={{ padding: '4px 0' }}>
                                <Image
                                    src={product.images && product.images.length > 0 
                                        ? (product.images[0].startsWith('http') 
                                            ? product.images[0] 
                                            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/product/${product.images[0]}`) 
                                        : "/no-image.png"}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    preview={false}
                                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <Flex vertical style={{ flex: 1, overflow: 'hidden' }}>
                                    <Text strong style={{ fontSize: '14px' }} ellipsis>{product.name}</Text>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {product.price.toLocaleString('vi-VN')} đ
                                    </Text>
                                </Flex>
                            </Flex>
                        ),
                        key: product._id,
                        slug: product.slug
                    }));
                    setOptions(searchOptions);
                }
            } catch (error) {
                console.error("Search error:", error);
            }
        }, 500),
        []
    );

    const onSelect = (value: string, option: any) => {
        router.push(`/products/${option.key}`);
    };

    return (
        <div style={{ width: '100%', maxWidth: 400 }}>
            <AutoComplete
                dropdownMatchSelectWidth={500}
                style={{ width: '100%' }}
                options={options}
                onSelect={onSelect}
                onSearch={handleSearch}
                size="large"
            >
                <Input
                    placeholder={t('searchPlaceholder')}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ borderRadius: '8px' }}
                />
            </AutoComplete>
        </div>
    );
}
