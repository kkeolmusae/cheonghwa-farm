import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Truck, Calendar } from 'lucide-react';

import { fetchProduct, productKeys } from '@/api/products';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { formatPrice } from '@/utils/format';
import { getProductStatus } from '@/constants/status';
import { cn } from '@/utils/cn';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProduct(productId),
    enabled: !isNaN(productId),
  });

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 py-20 text-center md:px-8">
        <p className="text-on-surface-variant">상품을 찾을 수 없습니다.</p>
        <Link
          to="/products"
          className="mt-4 inline-block font-headline text-sm font-bold text-primary-500 hover:text-primary-600"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

import type { Product } from '@/types/product';

function ProductDetail({ product }: { product: Product }) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    product.options[0]?.id ?? null,
  );

  const selectedOption = product.options.find((o) => o.id === selectedOptionId);
  const status = getProductStatus(product.status);
  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
  const subImages = [...product.images]
    .filter((img) => img.id !== primaryImage?.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const isSellable = ['판매_중', '판매중', 'on_sale'].includes(product.status);

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-14">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-1 font-headline text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <ChevronLeft className="h-4 w-4" />
          농작물 목록
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="overflow-hidden rounded-xl bg-surface-container-lowest p-2 shadow-ambient">
              {primaryImage ? (
                <img
                  src={primaryImage.image_url}
                  alt={product.name}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ) : (
                <ImagePlaceholder className="aspect-square w-full rounded-lg" />
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-headline text-[10px] font-bold uppercase tracking-wider text-on-tertiary-fixed">
                {product.category.name}
              </span>
            </div>

            <h1 className="mt-4 font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
              {product.name}
            </h1>

            {product.harvest_start && product.harvest_end && (
              <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
                <Calendar className="h-4 w-4" />
                <span>
                  수확 시기: {product.harvest_start} ~ {product.harvest_end}
                </span>
              </div>
            )}

            {product.options.length > 0 && (
              <div className="mt-10">
                <h3 className="font-headline text-sm font-bold text-on-surface">옵션 선택</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.options.map((option) => {
                    const outOfStock = option.stock_quantity <= 0;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => !outOfStock && setSelectedOptionId(option.id)}
                        disabled={outOfStock}
                        className={cn(
                          'rounded-xl border px-4 py-2.5 font-headline text-sm font-semibold transition-all',
                          option.id === selectedOptionId
                            ? 'border-primary-500 bg-primary-100 text-primary-700 shadow-ambient'
                            : outOfStock
                              ? 'cursor-not-allowed border-outline-variant/30 bg-surface-container text-on-surface-variant/40'
                              : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:border-primary-500/50 hover:bg-surface-container-low',
                        )}
                      >
                        {option.name}
                        {outOfStock && ' (품절)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedOption && (
              <div className="mt-8 rounded-xl bg-surface-container-high p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-on-surface-variant">{selectedOption.name}</span>
                  <span className="font-headline text-3xl font-black text-primary-500">
                    {formatPrice(selectedOption.price)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-surface-container-low p-5">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
              <div className="text-sm text-on-surface-variant">
                <p className="font-headline font-bold text-on-surface">배송 안내</p>
                <p className="mt-1">기본 배송비 3,000원 (30,000원 이상 무료)</p>
                <p>제주 추가 3,000원 · 도서산간 추가 5,000원</p>
              </div>
            </div>

            <Button size="lg" className="mt-10 w-full" disabled={!isSellable || !selectedOption}>
              {isSellable ? '주문하기' : '현재 주문이 불가합니다'}
            </Button>
            {!isSellable && (
              <p className="mt-3 text-center text-xs text-on-surface-variant">
                판매 중인 상품만 주문할 수 있습니다.
              </p>
            )}
          </div>
        </div>

        <section className="mt-20 md:mt-28">
          <h2 className="font-headline text-xl font-bold text-on-surface">상세설명</h2>
          {product.description.trim() ? (
            <p className="mt-6 whitespace-pre-line font-body text-lg leading-relaxed text-on-surface-variant">
              {product.description}
            </p>
          ) : (
            <p className="mt-6 text-sm text-on-surface-variant">등록된 상세설명이 없습니다.</p>
          )}
          {subImages.length > 0 && (
            <div className="mt-12 space-y-6">
              {subImages.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={product.name}
                  className="w-full rounded-xl object-cover shadow-ambient"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8 md:py-14">
      <Skeleton className="mb-8 h-5 w-28" />
      <div className="grid gap-12 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
      <div className="mt-20">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
      </div>
    </div>
  );
}
