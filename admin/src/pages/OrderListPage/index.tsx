import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrders, orderKeys } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDateTime, formatExpiresIn } from '@/utils/format';
import type { OrderListItem, OrderStatus } from '@/types/order';

const PAGE_SIZE = 20;

const STATUS_TABS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'pending', label: '요청 접수' },
  { value: 'payment_pending', label: '입금 대기' },
  { value: 'preparing', label: '수확 중' },
  { value: 'shipping', label: '배송 중' },
  { value: 'delivered', label: '배송 완료' },
  { value: 'cancelled', label: '취소됨' },
];

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

export default function OrderListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') as OrderStatus | null) ?? '';
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>(initialStatus);
  const [page, setPage] = useState(1);

  const filters = {
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading } = useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrders(filters),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  function handleTabChange(value: OrderStatus | '') {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">주문 관리</h1>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              statusFilter === tab.value
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>주문자</TableHead>
                <TableHead>배송지</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>배송방식</TableHead>
                <TableHead>주문일시</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((order: OrderListItem) => {
                const totalAmount = order.total_amount + order.delivery_fee;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm text-gray-700">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-gray-700">
                      {order.customer_address}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      {totalAmount.toLocaleString('ko-KR')}원
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {order.delivery_type}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_BADGE_CLASSES[order.status],
                        ].join(' ')}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                      {order.status === 'payment_pending' && order.expires_at && (() => {
                        const info = formatExpiresIn(order.expires_at);
                        return info ? (
                          <div className={['mt-1 text-xs font-medium', info.urgent ? 'text-red-600' : 'text-orange-600'].join(' ')}>
                            ⏱ {info.text}
                          </div>
                        ) : (
                          <div className="mt-1 text-xs font-medium text-gray-400">기한 만료</div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          상세
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">주문이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
