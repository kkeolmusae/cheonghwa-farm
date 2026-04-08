import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, PackageSearch } from 'lucide-react';
import type { OrderResponse, OrderStatus } from '@/types/order';
import { getOrderByNumber, orderKeys } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

/* =========================================================
   상태 타임라인 정의
   ========================================================= */

interface TimelineStep {
  key: OrderStatus;
  label: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'pending', label: '주문 접수' },
  { key: 'payment_pending', label: '입금 대기' },
  { key: 'preparing', label: '배송 준비 중' },
  { key: 'shipping', label: '배송 중' },
  { key: 'delivered', label: '배송 완료' },
];

const STATUS_ORDER: Record<Exclude<OrderStatus, 'cancelled'>, number> = {
  pending: 0,
  payment_pending: 1,
  preparing: 2,
  shipping: 3,
  delivered: 4,
};

/* =========================================================
   페이지
   ========================================================= */

export default function OrderStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') ?? '');
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');

  // 검색 실행 여부를 별도 state로 관리
  const [queryParams, setQueryParams] = useState<{ orderNumber: string; phone: string } | null>(
    () => {
      const o = searchParams.get('order');
      const p = searchParams.get('phone');
      return o && p ? { orderNumber: o, phone: p } : null;
    },
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: orderKeys.detail(queryParams?.orderNumber ?? '', queryParams?.phone ?? ''),
    queryFn: () => getOrderByNumber(queryParams!.orderNumber, queryParams!.phone),
    enabled: !!queryParams,
    retry: false,
  });

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    const params = { orderNumber: orderNumber.trim(), phone: phone.trim() };
    setQueryParams(params);
    setSearchParams({ order: params.orderNumber, phone: params.phone });
  }

  // URL 파라미터가 변경되면 폼 값 동기화
  useEffect(() => {
    const o = searchParams.get('order');
    const p = searchParams.get('phone');
    if (o) setOrderNumber(o);
    if (p) setPhone(p);
  }, [searchParams]);

  const errorMessage = isError
    ? (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
      '주문을 찾을 수 없습니다. 주문번호와 연락처를 확인해주세요.'
    : undefined;

  return (
    <div className="bg-surface min-h-screen">
      <div className="container-site py-10 md:py-14">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-1 font-headline text-sm font-medium text-on-muted transition-colors hover:text-on-surface"
        >
          <ChevronLeft className="h-4 w-4" />
          쇼핑 계속하기
        </Link>

        <div className="mx-auto max-w-lg">
          <h1 className="font-headline text-h2 font-extrabold text-on-bg">주문 조회</h1>
          <p className="mt-2 text-sm text-on-muted">주문번호와 주문 시 입력한 연락처로 조회하실 수 있습니다.</p>

          {/* 조회 폼 */}
          <Card className="mt-8">
            <CardBody>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="order_number" className="label">주문번호</label>
                  <input
                    id="order_number"
                    type="text"
                    className="input"
                    placeholder="주문번호를 입력해주세요"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="search_phone" className="label">연락처</label>
                  <input
                    id="search_phone"
                    type="tel"
                    inputMode="numeric"
                    className="input"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                  />
                </div>
                <Button
                  type="submit"
                  size="md"
                  className="w-full"
                  disabled={!orderNumber.trim() || !phone.trim()}
                >
                  조회하기
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* 결과 영역 */}
          {isLoading && <OrderStatusSkeleton />}

          {errorMessage && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-6 py-8 text-center">
              <PackageSearch className="h-10 w-10 text-red-300" />
              <p className="text-sm text-red-600">{errorMessage}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm font-semibold text-red-700 underline underline-offset-2"
              >
                다시 시도
              </button>
            </div>
          )}

          {data && <OrderStatusResult order={data} />}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   주문 결과 카드
   ========================================================= */

function OrderStatusResult({ order }: { order: OrderResponse }) {
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="mt-6 space-y-4 animate-fade-up">
      {/* 주문 기본 정보 */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">주문번호</p>
              <p className="mt-1 font-headline text-xl font-black tracking-wider text-on-bg">
                {order.order_number}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
            <Row label="주문자" value={order.customer_name} />
            <Row label="연락처" value={order.customer_phone} />
            <Row label="배송지" value={order.customer_address} />
            <Row label="배송 방식" value={order.delivery_type} />
            {order.delivery_note && <Row label="요청사항" value={order.delivery_note} />}
            {order.tracking_number && (
              <Row label="운송장 번호" value={order.tracking_number} highlight />
            )}
            <Row label="주문일시" value={formatDate(order.created_at)} />
          </div>
        </CardBody>
      </Card>

      {/* 취소 안내 */}
      {isCancelled && (
        <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="font-bold">주문이 취소되었습니다.</p>
          {order.cancel_reason && (
            <p className="mt-1 text-red-600">사유: {order.cancel_reason}</p>
          )}
        </div>
      )}

      {/* 상태 타임라인 */}
      {!isCancelled && <OrderTimeline status={order.status} />}

      {/* 주문 상품 */}
      <Card>
        <CardBody className="space-y-3">
          <p className="font-headline text-sm font-bold text-on-bg">주문 상품</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-on-surface">{item.product_name}</p>
                <p className="text-on-muted">
                  {item.option_name} · {item.quantity}개
                </p>
              </div>
              <p className="shrink-0 font-semibold text-on-surface">
                {formatPrice(item.unit_price * item.quantity)}
              </p>
            </div>
          ))}
          <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm">
            <div className="flex justify-between text-on-muted">
              <span>배송비</span>
              <span>{order.delivery_fee === 0 ? '무료' : formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-headline text-base font-bold text-on-bg">
              <span>합계</span>
              <span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* =========================================================
   상태 타임라인
   ========================================================= */

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null;

  const currentIndex = STATUS_ORDER[status as Exclude<OrderStatus, 'cancelled'>] ?? 0;

  return (
    <Card>
      <CardBody>
        <p className="mb-5 font-headline text-sm font-bold text-on-bg">배송 현황</p>
        <ol className="relative space-y-0">
          {TIMELINE_STEPS.map((step, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;

            return (
              <li key={step.key} className="flex gap-4">
                {/* Connector + Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                      isDone && 'border-primary bg-primary text-white',
                      isCurrent && 'border-primary bg-white text-primary shadow-glow-green',
                      isFuture && 'border-border bg-surface-muted text-on-subtle',
                    )}
                  >
                    {isDone ? (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-0.5 flex-1 my-1 min-h-[1.5rem]',
                        idx < currentIndex ? 'bg-primary' : 'bg-border/60',
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pb-5 pt-0.5">
                  <p
                    className={cn(
                      'font-headline text-sm font-semibold leading-6',
                      isDone && 'text-on-muted',
                      isCurrent && 'text-primary font-bold',
                      isFuture && 'text-on-subtle',
                    )}
                  >
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 inline-flex h-5 items-center rounded-full bg-primary px-2 text-[0.65rem] font-bold text-white">
                        현재
                      </span>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardBody>
    </Card>
  );
}

/* =========================================================
   소형 헬퍼 컴포넌트
   ========================================================= */

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 text-on-muted">{label}</span>
      <span
        className={cn(
          'text-right',
          highlight ? 'font-semibold text-primary' : 'text-on-surface',
        )}
      >
        {value}
      </span>
    </div>
  );
}

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: '주문 접수', className: 'badge bg-blue-50 text-blue-700' },
  payment_pending: { label: '입금 대기', className: 'badge bg-gold-100 text-gold-800' },
  preparing: { label: '배송 준비', className: 'badge bg-forest-100 text-forest-700' },
  shipping: { label: '배송 중', className: 'badge bg-forest-100 text-forest-700' },
  delivered: { label: '배송 완료', className: 'badge bg-forest-100 text-forest-700' },
  cancelled: { label: '취소됨', className: 'badge bg-red-50 text-red-700' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return <span className={meta.className}>{meta.label}</span>;
}

function OrderStatusSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-border/60 bg-surface-raised p-5 shadow-card">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-8 w-48" />
        <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-surface-raised p-5 shadow-card">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
