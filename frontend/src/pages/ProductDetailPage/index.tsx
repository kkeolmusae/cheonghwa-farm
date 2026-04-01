import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Truck, Calendar } from "lucide-react";
import type { Product } from "@/types/product";

import { fetchProduct, productKeys } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { formatPrice } from "@/utils/format";
import { getProductStatus } from "@/constants/status";
import { cn } from "@/utils/cn";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProduct(productId),
    enabled: !isNaN(productId),
  });

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-on-muted">상품을 찾을 수 없습니다.</p>
        <Link to="/products" className="mt-4 inline-block font-headline text-sm font-bold text-primary hover:text-primary-dark">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(product.options[0]?.id ?? null);

  const selectedOption = product.options.find((o) => o.id === selectedOptionId);
  const status = getProductStatus(product.status);
  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
  const subImages = [...product.images].filter((img) => img.id !== primaryImage?.id).sort((a, b) => a.sort_order - b.sort_order);

  const isSellable = ["판매 중", "판매중", "on_sale"].includes(product.status);

  return (
    <div className="bg-surface">
      <div className="container-site py-10 md:py-14">
        <Link to="/products" className="mb-8 inline-flex items-center gap-1 font-headline text-sm font-medium text-on-muted transition-colors hover:text-on-surface">
          <ChevronLeft className="h-4 w-4" />
          농작물 목록
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div>
            <div className="overflow-hidden rounded-2xl bg-surface-muted p-2 shadow-sm">
              {primaryImage ? (
                <img src={primaryImage.image_url} alt={product.name} className="aspect-square w-full rounded-xl object-cover" />
              ) : (
                <ImagePlaceholder className="aspect-square w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className="badge-sm badge-stone">{product.category.name}</span>
            </div>

            <h1 className="mt-4 font-headline text-h1 font-extrabold text-on-bg">{product.name}</h1>

            {product.harvest_start && product.harvest_end && (
              <div className="mt-3 flex items-center gap-2 text-sm text-on-muted">
                <Calendar className="h-4 w-4" />
                <span>
                  수확 시기: {product.harvest_start} ~ {product.harvest_end}
                </span>
              </div>
            )}

            {/* Options */}
            {product.options.length > 0 && (
              <div className="mt-10">
                <h3 className="font-headline text-sm font-bold text-on-bg">옵션 선택</h3>
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
                          "rounded-xl border px-4 py-2.5 font-headline text-sm font-semibold transition-all",
                          option.id === selectedOptionId
                            ? "border-primary bg-primary-surface text-forest-700 shadow-sm"
                            : outOfStock
                              ? "cursor-not-allowed border-border/30 bg-stone-50 text-on-muted/40"
                              : "border-border/40 bg-surface-raised text-on-surface hover:border-primary/50 hover:bg-primary-surface/50",
                        )}
                      >
                        {option.name}
                        {outOfStock && " (품절)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price */}
            {selectedOption && (
              <div className="mt-8 rounded-2xl bg-stone-50 p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-on-muted">{selectedOption.name}</span>
                  <span className="font-display text-display-lg font-black text-primary">{formatPrice(selectedOption.price)}</span>
                </div>
              </div>
            )}

            {/* Shipping */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-forest-50 p-5">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm text-on-muted">
                <p className="font-headline font-bold text-on-bg">배송 안내</p>
                <p className="mt-1">기본 배송비 3,000원 (30,000원 이상 무료)</p>
                <p>제주 추가 3,000원 · 도서산간 추가 5,000원</p>
              </div>
            </div>

            <Button size="lg" className="mt-8 w-full" disabled={!isSellable || !selectedOption}>
              {isSellable ? "주문하기" : "현재 주문이 불가합니다"}
            </Button>
            {!isSellable && <p className="mt-3 text-center text-xs text-on-muted">판매 중인 상품만 주문할 수 있습니다.</p>}
          </div>
        </div>

        {/* Description */}
        <section className="mt-20 md:mt-28">
          <h2 className="font-headline text-xl font-bold text-on-bg">상세설명</h2>
          {product.description.trim() ? (
            <p className="mt-6 whitespace-pre-line font-body text-body-lg leading-relaxed text-on-muted">{product.description}</p>
          ) : (
            <p className="mt-6 text-sm text-on-subtle">등록된 상세설명이 없습니다.</p>
          )}
          {subImages.length > 0 && (
            <div className="mt-12 space-y-6">
              {subImages.map((img) => (
                <img key={img.id} src={img.image_url} alt={product.name} className="w-full rounded-2xl object-cover shadow-sm" loading="lazy" />
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
    <div className="container-site py-10 md:py-14">
      <Skeleton className="mb-8 h-5 w-28" />
      <div className="grid gap-12 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-20 w-full rounded-2xl" />
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
