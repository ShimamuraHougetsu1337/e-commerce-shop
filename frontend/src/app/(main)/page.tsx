import BenefitsBar from '@/components/homepage/benefits.bar';
import CategorySection from '@/components/homepage/category.section';
import HeroBanner from '@/components/homepage/hero.banner';
import ProductSection from '@/components/homepage/product.section';
import PromoSection from '@/components/homepage/promo.section';
import { fetchCategories, fetchProductsPagination } from '@/utils/auth.api';

export default async function Home() {

  const newProductsResponse = await fetchProductsPagination({ current: 1, pageSize: 8, sort: '-createdAt' });
  const newProducts = newProductsResponse.data?.result

  const popularProductsResponse = await fetchProductsPagination({ current: 1, pageSize: 8, sort: '-averageRating' });
  const popularProducts = popularProductsResponse.data?.result

  const resCategories = await fetchCategories({ current: 1, pageSize: 100 });
  const categoryList = resCategories.data?.result ?? [];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="bg-[#f5f7fa] pb-10">
          <HeroBanner products={newProducts} />
          <PromoSection products={newProducts} />
        </div>

        <BenefitsBar />

        <CategorySection categoryList={categoryList} />

        <div className="bg-[#fafbfc] pt-5">
          <ProductSection title="Hàng Mới" productList={newProducts} viewAllHref="/products?sort=newest" />
        </div>

        <ProductSection title="Hàng Bán Chạy" productList={popularProducts} viewAllHref="/products?sort=popular" />
      </main>
    </div>
  );
}