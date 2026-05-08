'use client';
import ProductCard from '@/components/product/product-card';
import { fetchCategories, fetchProductsPagination } from '@/utils/auth.api';
import {
  FilterOutlined, HomeOutlined
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Checkbox,
  Col,
  Collapse,
  Drawer,
  Flex,
  InputNumber,
  Layout,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Typography
} from 'antd';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const { Content, Sider } = Layout;
const { Text } = Typography;

function ProductsContent() {
  const t = useTranslations('ProductsPage');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialSort = searchParams.get('sort') || 'popular';
  const initialCategory = searchParams.get('category');
  const initialCategories = initialCategory ? initialCategory.split(',') : [];
  const initialMinPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') as string, 10) : null;
  const initialMaxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') as string, 10) : null;
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortOption, setSortOption] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 12;

  const [productList, setProductList] = useState<IProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [draftCategories, setDraftCategories] = useState<string[]>(initialCategories);
  const [draftPriceRange, setDraftPriceRange] = useState<{ min: number | null, max: number | null }>({ min: initialMinPrice, max: initialMaxPrice });

  const [appliedCategories, setAppliedCategories] = useState<string[]>(initialCategories);
  const [appliedPriceRange, setAppliedPriceRange] = useState<{ min: number | null, max: number | null }>({ min: initialMinPrice, max: initialMaxPrice });


  const updateURL = useCallback((params: Record<string, string | number | null | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const getCategories = async () => {
      const res = await fetchCategories({ current: 1, pageSize: 100 });
      if (res && res.data) {
        setCategories(res.data.result);
      }
      setCategoriesLoaded(true);
    };
    getCategories();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);

  useEffect(() => {
    if (!categoriesLoaded) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let aqpSort = undefined;
        if (sortOption === 'price_asc') aqpSort = 'price';
        else if (sortOption === 'price_desc') aqpSort = '-price';
        else if (sortOption === 'newest') aqpSort = '-createdAt';
        else if (sortOption === 'popular') aqpSort = '-averageRating';

        const categoryIds = appliedCategories
          .map(slug => categories.find(c => c.slug === slug)?._id)
          .filter(Boolean);

        const response = await fetchProductsPagination({
          current: currentPage,
          pageSize,
          sort: aqpSort,
          category: categoryIds.length > 0 ? categoryIds.join(',') : undefined,
          minPrice: appliedPriceRange.min ?? undefined,
          maxPrice: appliedPriceRange.max ?? undefined,
        });

        if (response && response.data) {
          setProductList(response.data.result);
          setTotalProducts(response.data.meta.total);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, sortOption, appliedCategories, appliedPriceRange, categoriesLoaded, categories]);

  const handleApplyFilters = () => {
    setAppliedCategories(draftCategories);
    setAppliedPriceRange(draftPriceRange);
    setCurrentPage(1);
    setFilterDrawerOpen(false);
    updateURL({
      category: draftCategories.length > 0 ? draftCategories.join(',') : null,
      minPrice: draftPriceRange.min,
      maxPrice: draftPriceRange.max,
      page: 1
    });
  };

  const FilterContent = () => (
    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Flex align="center" gap="small" style={{ marginBottom: '16px' }}>
        <FilterOutlined style={{ fontSize: 16 }} />
        <Text strong style={{ fontSize: '16px' }}>{t('filter')}</Text>
      </Flex>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Collapse
          defaultActiveKey={['1', '2']}
          ghost
          items={[
            {
              key: '1',
              label: <Text strong>{t('category')}</Text>,
              children: (
                <Checkbox.Group
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  options={categories.map(c => ({ label: c.name, value: c.slug }))}
                  value={draftCategories}
                  onChange={(checkedValues) => setDraftCategories(checkedValues as string[])}
                />
              )
            },
            {
              key: '2',
              label: <Text strong>{t('priceRange')}</Text>,
              children: (
                <Flex align="center" gap="small">
                  <InputNumber
                    placeholder="Min"
                    min={0}
                    value={draftPriceRange.min}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    onChange={(val) => setDraftPriceRange(prev => ({ ...prev, min: val }))}
                  />
                  <Text>-</Text>
                  <InputNumber
                    placeholder="Max"
                    min={0}
                    value={draftPriceRange.max}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    onChange={(val) => setDraftPriceRange(prev => ({ ...prev, max: val }))}
                  />
                </Flex>
              )
            }
          ]}
        />
        <Button
          type="primary"
          size="large"
          block
          style={{ marginTop: '24px' }}
          onClick={handleApplyFilters}
        >
          {t('applyFilter')}
        </Button>
      </div>
    </div>
  );

  return (
    <Content>
      <div className='pdp-container'>
        <Breadcrumb
          separator=">"
          className='pdp-breadcrumb'
          items={[
            {
              title: (
                <Link href="/">
                  <Space size="small">
                    <HomeOutlined />
                    <span>{t('home')}</span>
                  </Space>
                </Link>
              ),
            },
            { title: t('store') }
          ]}
        />

        <Layout style={{ background: 'transparent' }}>
          <Sider width={260} className="desktop-only-block" style={{ background: 'transparent', marginRight: '24px' }}>
            <FilterContent />
          </Sider>

          <Drawer
            className='mobile-only-block'
            title={t('filter')}
            placement="left"
            onClose={() => setFilterDrawerOpen(false)}
            open={filterDrawerOpen}
            styles={{ body: { padding: 0, background: '#f0f2f5' } }}
          >
            <FilterContent />
          </Drawer>

          <Content style={{ minHeight: 280 }}>
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap="middle"
              style={{
                backgroundColor: '#fff',
                padding: '16px 24px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}
            >
              <Flex align="center" gap="middle">
                <Button
                  className='mobile-only-flex'
                  icon={<FilterOutlined />}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  {t('filter')}
                </Button>
                <Text strong style={{ fontSize: 18, margin: 0 }}>{t('popularProducts')}</Text>
              </Flex>

              <Space>
                <Text type="secondary" className="desktop-only-inline">{t('sortBy')}:</Text>
                <Select value={sortOption} onChange={(val) => { setSortOption(val); setCurrentPage(1); updateURL({ sort: val, page: 1 }); }} style={{ width: 140 }}>
                  <Select.Option value="popular">{t('sortPopular')}</Select.Option>
                  <Select.Option value="price_asc">{t('sortPriceAsc')}</Select.Option>
                  <Select.Option value="price_desc">{t('sortPriceDesc')}</Select.Option>
                  <Select.Option value="newest">{t('sortNewest')}</Select.Option>
                </Select>
              </Space>
            </Flex>

            {loading ? (
              <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
                <Spin size="large" />
              </Flex>
            ) : (
              <>
                <Row gutter={[16, 24]}>
                  {productList.map((product) => (
                    <Col xs={12} sm={12} md={12} lg={8} xl={8} key={product._id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>

                <Flex justify="center" style={{ margin: '40px 0' }}>
                  <Pagination
                    current={currentPage}
                    total={totalProducts}
                    pageSize={12}
                    showSizeChanger={false}
                    responsive
                    onChange={(page) => {
                      setCurrentPage(page);
                      updateURL({ page });
                    }}
                  />
                </Flex>
              </>
            )}
          </Content>
        </Layout>
      </div>
    </Content>
  );
}

export default function PopularProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}