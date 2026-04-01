import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { fetchProducts, fetchCategories, productKeys, categoryKeys } from '@/api/products';
import { fetchSiteSettings, siteSettingsKeys } from '@/api/siteSettings';
import { toAbsoluteMediaUrl } from '@/utils/mediaUrl';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { formatPrice } from '@/utils/format';
import { getProductStatus } from '@/constants/status';
import { cn } from '@/utils/cn';
import { STITCH_SHOP_HERO_TEXTURE } from '@/constants/stitchAssets';
import { FARM_INFO } from '@/constants/farm';

const LIMIT = 12;

export default function ProductListPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [offset, setOffset] = useState(0);

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const productsQuery = useQuery({
    queryKey: productKeys.list({ category_id: categoryId, offset, limit: LIMIT }),
    queryFn: () => fetchProducts({ category_id: categoryId, offset, limit: LIMIT }),
  });

  const { data: siteImg } = useQuery({
    queryKey: siteSettingsKeys.all,
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });

  const shopTextureUrl = siteImg?.shop_hero_texture_url
    ? toAbsoluteMediaUrl(siteImg.shop_hero_texture_url)
    : STITCH_SHOP_HERO_TEXTURE;

  const handleCategoryChange = (id: number | undefined) => {
    setCategoryId(id);
    setOffset(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="px-4 pt-8 pb-10 md:px-8 md:pt-12">
        <div className="relative mx-auto max-w-[82rem] overflow-hidden rounded-3xl bg-surface-muted px-6 py-14 text-center md:p-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${shopTextureUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-hidden
          />
          <span className="relative z-10 eyebrow justify-center mb-5">
            Seasonal Selection
          </span>
          <h1 className="relative z-10 font-display text-display-lg font-extrabold tracking-tighter text-on-bg text-balance">
            {FARM_INFO.name}에서 가장 신선한 수확
          </h1>
          <p className="relative z-10 mx-auto mt-5 max-w-xl font-body text-body-lg text-on-muted text-pretty">
            흙에서 주방까지, 중간 유통 없이 정직하게 전합니다.
          </p>
        </div>
      </section>

      <div className="container-site pb-16 md:pb-20">
        {/* Category Filter */}
        {categoriesQuery.data && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange(undefined)}
              className={cn(categoryId === undefined ? 'chip-active' : 'chip')}
            >
              전체
            </button>
            {categoriesQuery.data.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(categoryId === cat.id ? 'chip-active' : 'chip')}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {productsQuery.isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : !productsQuery.data?.items.length ? (
          <div className="mt-16">
            <EmptyState
              title="등록된 농작물이 없습니다"
              description="아직 준비 중입니다. 조금만 기다려주세요!"
            />
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {productsQuery.data.items.map((product) => {
                const status = getProductStatus(product.status);
                const minPrice = product.options.length
                  ? Math.min(...product.options.map((o) => o.price))
                  : null;

                return (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <Card hover className="group h-full overflow-hidden">
                      <div className="p-2">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image.thumbnail_url ?? product.primary_image.image_url}
                            alt={product.name}
                            className="aspect-square w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <ImagePlaceholder className="aspect-square w-full rounded-xl" />
                        )}
                      </div>
                      <div className="px-5 pb-6 pt-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <span className="text-caption font-semibold uppercase tracking-wide text-on-subtle">
                            {product.category.name}
                          </span>
                        </div>
                        <h3 className="mt-2 font-headline text-base font-bold text-on-bg">{product.name}</h3>
                        {minPrice != null && (
                          <p className="mt-1.5 font-headline text-base font-black text-primary">
                            {formatPrice(minPrice)}~
                          </p>
                        )}
                        {product.harvest_start && product.harvest_end && (
                          <p className="mt-1.5 text-caption text-on-subtle">
                            수확 {product.harvest_start} ~ {product.harvest_end}
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-14">
              <Pagination
                total={productsQuery.data.total}
                offset={offset}
                limit={LIMIT}
                onChange={setOffset}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
