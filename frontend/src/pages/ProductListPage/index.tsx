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
      <section className="px-4 pt-8 pb-10 md:px-8 md:pt-12">
        <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-[2.5rem] bg-surface-container-low px-6 py-14 text-center md:p-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${shopTextureUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-hidden
          />
          <span className="relative z-10 mb-6 inline-block font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary-500">
            Seasonal Selection
          </span>
          <h1 className="relative z-10 mx-auto max-w-4xl font-headline text-4xl font-extrabold tracking-tighter text-on-background md:text-6xl lg:text-7xl">
            {FARM_INFO.name}에서 가장 신선한 수확
          </h1>
          <p className="relative z-10 mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-secondary">
            흙에서 주방까지, 중간 유통 없이 정직하게 전합니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-screen-2xl px-4 pb-16 md:px-8 md:pb-20">
        {categoriesQuery.data && (
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange(undefined)}
              className={cn(
                'rounded-full px-5 py-2 font-headline text-sm font-bold transition-all',
                categoryId === undefined
                  ? 'bg-primary-500 text-on-primary shadow-ambient'
                  : 'bg-surface-container-lowest text-on-surface-variant shadow-ambient hover:bg-surface-container-high',
              )}
            >
              전체
            </button>
            {categoriesQuery.data.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  'rounded-full px-5 py-2 font-headline text-sm font-bold transition-all',
                  categoryId === cat.id
                    ? 'bg-primary-500 text-on-primary shadow-ambient'
                    : 'bg-surface-container-lowest text-on-surface-variant shadow-ambient hover:bg-surface-container-high',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {productsQuery.isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
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
            <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {productsQuery.data.items.map((product) => {
                const status = getProductStatus(product.status);
                const minPrice = product.options.length
                  ? Math.min(...product.options.map((o) => o.price))
                  : null;

                return (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <Card className="group h-full overflow-hidden">
                      <div className="p-2">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image.thumbnail_url ?? product.primary_image.image_url}
                            alt={product.name}
                            className="aspect-square w-full rounded-lg object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <ImagePlaceholder className="aspect-square w-full rounded-lg" />
                        )}
                      </div>
                      <div className="px-5 pb-6 pt-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                            {product.category.name}
                          </span>
                        </div>
                        <h3 className="mt-3 font-headline text-lg font-bold text-on-surface">{product.name}</h3>
                        {minPrice != null && (
                          <p className="mt-2 font-headline text-lg font-black text-primary-500">
                            {formatPrice(minPrice)}~
                          </p>
                        )}
                        {product.harvest_start && product.harvest_end && (
                          <p className="mt-2 text-xs text-on-surface-variant">
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
