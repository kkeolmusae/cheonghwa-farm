import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getOrder,
  acceptOrder,
  harvestOrder,
  shipOrder,
  completeOrder,
  cancelOrder,
  orderKeys,
} from '@/api/orders';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatDateTime, formatExpiresIn } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { OrderStatus } from '@/types/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '요청 접수',
  payment_pending: '입금 대기',
  preparing: '수확 중',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
};

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  payment_pending: 'bg-orange-100 text-orange-700',
  preparing: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

/* =========================================================
   컨펌 다이얼로그
   ========================================================= */

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'blue' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* 다이얼로그 */}
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={loading}
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   메인 페이지
   ========================================================= */

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderId = Number(id);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showHarvestConfirm, setShowHarvestConfirm] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  function invalidateAndRefetch() {
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
  }

  const acceptMutation = useMutation({
    mutationFn: () => acceptOrder(orderId),
    onSuccess: () => {
      invalidateAndRefetch();
      setShowAcceptConfirm(false);
      toast.success('주문을 수락했습니다. 고객에게 입금 안내 SMS를 발송했습니다.');
    },
    onError: () => toast.error('주문 수락에 실패했습니다.'),
  });

  const harvestMutation = useMutation({
    mutationFn: () => harvestOrder(orderId),
    onSuccess: () => {
      invalidateAndRefetch();
      setShowHarvestConfirm(false);
      toast.success('수확을 시작했습니다. 고객에게 배송 준비 SMS를 발송했습니다.');
    },
    onError: () => toast.error('수확 시작에 실패했습니다.'),
  });

  const shipMutation = useMutation({
    mutationFn: () => shipOrder(orderId, trackingNumber),
    onSuccess: () => {
      invalidateAndRefetch();
      setTrackingNumber('');
      toast.success('배송을 시작했습니다.');
    },
    onError: () => toast.error('배송 시작에 실패했습니다.'),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeOrder(orderId),
    onSuccess: () => {
      invalidateAndRefetch();
      toast.success('배송 완료 처리되었습니다.');
    },
    onError: () => toast.error('배송 완료 처리에 실패했습니다.'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId, cancelReason),
    onSuccess: () => {
      invalidateAndRefetch();
      setShowCancelForm(false);
      setCancelReason('');
      toast.success('주문이 취소되었습니다.');
    },
    onError: () => toast.error('주문 취소에 실패했습니다.'),
  });

  function handleCancelSubmit() {
    if (!cancelReason.trim()) {
      setCancelReasonError('취소 사유를 입력해주세요.');
      return;
    }
    setCancelReasonError('');
    cancelMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
        <p className="text-gray-500">주문 정보를 불러오지 못했습니다.</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/orders')}
        >
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const isActionPending =
    acceptMutation.isPending ||
    harvestMutation.isPending ||
    shipMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending;

  return (
    <>
      {/* 수락하기 컨펌 다이얼로그 */}
      <ConfirmDialog
        isOpen={showAcceptConfirm}
        title="주문을 수락하시겠습니까?"
        message="수락하면 고객에게 입금 계좌 안내 SMS가 즉시 발송됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="수락하기"
        confirmVariant="primary"
        loading={acceptMutation.isPending}
        onConfirm={() => acceptMutation.mutate()}
        onCancel={() => setShowAcceptConfirm(false)}
      />

      {/* 수확 시작 컨펌 다이얼로그 */}
      <ConfirmDialog
        isOpen={showHarvestConfirm}
        title="수확을 시작하시겠습니까?"
        message="입금을 확인하셨나요? 수확 시작 SMS가 고객에게 발송됩니다."
        confirmLabel="수확 시작"
        confirmVariant="blue"
        loading={harvestMutation.isPending}
        onConfirm={() => harvestMutation.mutate()}
        onCancel={() => setShowHarvestConfirm(false)}
      />

      <div className="space-y-4">
        {/* 상단 헤더 */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            주문 목록
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-mono text-base font-semibold text-gray-900">
            {order.order_number}
          </h1>
          <span
            className={[
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              STATUS_BADGE_CLASSES[order.status],
            ].join(' ')}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <OrderStepper status={order.status} />

        <div className="grid gap-4 lg:grid-cols-3">
          {/* 왼쪽 컬럼 */}
          <div className="space-y-4 lg:col-span-2">
            {/* 주문 상품 */}
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-gray-900">주문 상품</h2>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{item.option_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700">
                        {item.unit_price.toLocaleString('ko-KR')}원 × {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {(item.unit_price * item.quantity).toLocaleString('ko-KR')}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>상품 금액</span>
                  <span>{order.total_amount.toLocaleString('ko-KR')}원</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                  <span>배송비</span>
                  <span>{order.delivery_fee.toLocaleString('ko-KR')}원</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-base font-bold text-gray-900">
                  <span>합계</span>
                  <span>
                    {(order.total_amount + order.delivery_fee).toLocaleString('ko-KR')}원
                  </span>
                </div>
              </div>
            </Card>

            {/* 고객 정보 */}
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-gray-900">고객 정보</h2>
              <dl className="space-y-2">
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-sm text-gray-500">이름</dt>
                  <dd className="text-sm text-gray-900">{order.customer_name}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-sm text-gray-500">연락처</dt>
                  <dd className="text-sm text-gray-900">{order.customer_phone}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-sm text-gray-500">주소</dt>
                  <dd className="text-sm text-gray-900">{order.customer_address}</dd>
                </div>
              </dl>
            </Card>

            {/* 배송 정보 */}
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-gray-900">배송 정보</h2>
              <dl className="space-y-2">
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-sm text-gray-500">배송 방식</dt>
                  <dd className="text-sm text-gray-900">{order.delivery_type}</dd>
                </div>
                {order.delivery_note && (
                  <div className="flex gap-4">
                    <dt className="w-20 shrink-0 text-sm text-gray-500">배송 메모</dt>
                    <dd className="text-sm text-gray-900">{order.delivery_note}</dd>
                  </div>
                )}
                {order.tracking_number && (
                  <div className="flex gap-4">
                    <dt className="w-20 shrink-0 text-sm text-gray-500">송장번호</dt>
                    <dd className="font-mono text-sm text-gray-900">{order.tracking_number}</dd>
                  </div>
                )}
                {order.cancel_reason && (
                  <div className="flex gap-4">
                    <dt className="w-20 shrink-0 text-sm text-gray-500">취소 사유</dt>
                    <dd className="text-sm text-gray-900">{order.cancel_reason}</dd>
                  </div>
                )}
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-sm text-gray-500">주문일시</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(order.created_at)}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-sm text-gray-500">수정일시</dt>
                  <dd className="text-sm text-gray-900">{formatDateTime(order.updated_at)}</dd>
                </div>
              </dl>
            </Card>
          </div>

          {/* 오른쪽: 주문 처리 카드 */}
          <div>
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-gray-900">주문 처리</h2>

              {/* pending: 수락하기 */}
              {order.status === 'pending' && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    loading={acceptMutation.isPending}
                    disabled={isActionPending}
                    onClick={() => setShowAcceptConfirm(true)}
                  >
                    수락하기
                  </Button>
                  {!showCancelForm ? (
                    <Button
                      variant="secondary"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      disabled={isActionPending}
                      onClick={() => setShowCancelForm(true)}
                    >
                      주문 취소
                    </Button>
                  ) : (
                    <CancelForm
                      value={cancelReason}
                      onChange={setCancelReason}
                      error={cancelReasonError}
                      loading={cancelMutation.isPending}
                      disabled={isActionPending}
                      onSubmit={handleCancelSubmit}
                      onCancel={() => {
                        setShowCancelForm(false);
                        setCancelReason('');
                        setCancelReasonError('');
                      }}
                    />
                  )}
                </div>
              )}

              {/* payment_pending: 입금 대기 배너 + 수확하기 */}
              {order.status === 'payment_pending' && (
                <div className="space-y-3">
                  {/* 입금 대기 안내 배너 */}
                  <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                    <p className="text-sm font-semibold text-orange-800">입금 대기 중</p>
                    <p className="mt-1 text-xs leading-relaxed text-orange-700">
                      고객의 입금을 확인한 후<br />
                      <strong>수확 시작</strong> 버튼을 눌러주세요.
                    </p>
                    <p className="mt-2 text-xs font-bold text-orange-900">
                      입금 금액: {(order.total_amount + order.delivery_fee).toLocaleString('ko-KR')}원
                    </p>
                    {order.expires_at && (() => {
                      const info = formatExpiresIn(order.expires_at);
                      return info ? (
                        <p className={['mt-1.5 text-xs font-semibold', info.urgent ? 'text-red-700' : 'text-orange-800'].join(' ')}>
                          ⏱ 입금 기한: {info.text}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs font-semibold text-gray-500">입금 기한 만료 (자동 취소 처리됨)</p>
                      );
                    })()}
                  </div>

                  <Button
                    variant="blue"
                    className="w-full"
                    loading={harvestMutation.isPending}
                    disabled={isActionPending}
                    onClick={() => setShowHarvestConfirm(true)}
                  >
                    수확 시작
                  </Button>
                  {!showCancelForm ? (
                    <Button
                      variant="secondary"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      disabled={isActionPending}
                      onClick={() => setShowCancelForm(true)}
                    >
                      주문 취소
                    </Button>
                  ) : (
                    <CancelForm
                      value={cancelReason}
                      onChange={setCancelReason}
                      error={cancelReasonError}
                      loading={cancelMutation.isPending}
                      disabled={isActionPending}
                      onSubmit={handleCancelSubmit}
                      onCancel={() => {
                        setShowCancelForm(false);
                        setCancelReason('');
                        setCancelReasonError('');
                      }}
                    />
                  )}
                </div>
              )}

              {/* preparing: 배송 시작 */}
              {order.status === 'preparing' && (
                <div className="space-y-3">
                  <Input
                    label="송장번호"
                    placeholder="송장번호를 입력하세요"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    loading={shipMutation.isPending}
                    disabled={!trackingNumber.trim() || isActionPending}
                    onClick={() => shipMutation.mutate()}
                  >
                    배송 시작
                  </Button>
                </div>
              )}

              {/* shipping: 배송 완료 */}
              {order.status === 'shipping' && (
                <Button
                  className="w-full"
                  loading={completeMutation.isPending}
                  disabled={isActionPending}
                  onClick={() => completeMutation.mutate()}
                >
                  배송 완료
                </Button>
              )}

              {(order.status === 'delivered' || order.status === 'cancelled') && (
                <p className="text-sm text-gray-500">처리 완료된 주문입니다.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   주문 진행 스테퍼
   ========================================================= */

const STEP_COLOR = { bg: 'bg-primary-600', ring: 'ring-primary-300', line: 'bg-primary-500' };

const ORDER_STEPS: { status: OrderStatus; label: string; bg: string; ring: string; line: string }[] = [
  { status: 'pending',         label: '요청 접수', ...STEP_COLOR },
  { status: 'payment_pending', label: '입금 대기', ...STEP_COLOR },
  { status: 'preparing',       label: '수확 중',   ...STEP_COLOR },
  { status: 'shipping',        label: '배송 중',   ...STEP_COLOR },
  { status: 'delivered',       label: '배송 완료', ...STEP_COLOR },
];

function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <X className="h-4 w-4 shrink-0" />
        <span className="font-medium">주문이 취소되었습니다.</span>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5">
      <div className="flex items-start">
        {ORDER_STEPS.map((step, i) => {
          const isPast    = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.status} className="flex flex-1 items-start">
              {/* 원 + 라벨 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all',
                    isPast    && `${step.bg} text-white`,
                    isCurrent && `${step.bg} text-white ring-4 ${step.ring}`,
                    !isPast && !isCurrent && 'border-2 border-gray-200 bg-white text-gray-400',
                  )}
                >
                  {isPast ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs font-medium',
                    isCurrent && 'font-semibold text-gray-900',
                    isPast    && 'text-gray-500',
                    !isPast && !isCurrent && 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* 연결선 (마지막 제외) */}
              {i < ORDER_STEPS.length - 1 && (
                <div className="mt-[1.0625rem] flex-1 px-1">
                  <div className={cn('h-0.5 w-full', currentIndex > i ? step.line : 'bg-gray-200')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   취소 폼
   ========================================================= */

interface CancelFormProps {
  value: string;
  onChange: (v: string) => void;
  error: string;
  loading: boolean;
  disabled: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

function CancelForm({ value, onChange, error, loading, disabled, onSubmit, onCancel }: CancelFormProps) {
  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
      <Textarea
        label="취소 사유"
        placeholder="취소 사유를 입력해주세요"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          disabled={disabled}
          onClick={onCancel}
        >
          닫기
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          loading={loading}
          disabled={disabled}
          onClick={onSubmit}
        >
          확인
        </Button>
      </div>
    </div>
  );
}
