import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, TrendingUp, BookOpen, Megaphone, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listProducts, productKeys } from '@/api/products';
import { listJournals, journalKeys } from '@/api/journals';
import { listNotices, noticeKeys } from '@/api/notices';
import { getOrders, orderKeys } from '@/api/orders';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatPrice, formatDate } from '@/utils/format';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  '판매 예정': 'default',
  '판매 중': 'success',
  '품절': 'danger',
  '판매 종료': 'warning',
};

export default function DashboardPage() {
  const productsQuery = useQuery({
    queryKey: productKeys.list({ offset: 0, limit: 5 }),
    queryFn: () => listProducts({ offset: 0, limit: 5 }),
  });

  const allProductsQuery = useQuery({
    queryKey: productKeys.list({ offset: 0, limit: 1, _tag: 'all' }),
    queryFn: () => listProducts({ offset: 0, limit: 1 }),
  });

  const journalsQuery = useQuery({
    queryKey: journalKeys.list({ offset: 0, limit: 1 }),
    queryFn: () => listJournals({ offset: 0, limit: 1 }),
  });

  const noticesQuery = useQuery({
    queryKey: noticeKeys.list({ offset: 0, limit: 1 }),
    queryFn: () => listNotices({ offset: 0, limit: 1 }),
  });

  const pendingOrdersQuery = useQuery({
    queryKey: orderKeys.list({ status: 'pending', offset: 0, limit: 1 }),
    queryFn: () => getOrders({ status: 'pending', offset: 0, limit: 1 }),
  });

  const paymentPendingOrdersQuery = useQuery({
    queryKey: orderKeys.list({ status: 'payment_pending', offset: 0, limit: 1 }),
    queryFn: () => getOrders({ status: 'payment_pending', offset: 0, limit: 1 }),
  });

  const pendingOrderCount =
    (pendingOrdersQuery.data?.total ?? 0) + (paymentPendingOrdersQuery.data?.total ?? 0);
  const isOrdersLoading = pendingOrdersQuery.isLoading || paymentPendingOrdersQuery.isLoading;

  const stats = [
    {
      label: '전체 상품',
      value: allProductsQuery.data?.total ?? '-',
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: '판매 중',
      value: productsQuery.data
        ? productsQuery.data.items.filter((p) => p.status === '판매 중').length
        : '-',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: '농장일지',
      value: journalsQuery.data?.total ?? '-',
      icon: BookOpen,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: '공지사항',
      value: noticesQuery.data?.total ?? '-',
      icon: Megaphone,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: '미처리 주문',
      value: isOrdersLoading ? '-' : pendingOrderCount,
      icon: Package,
      color: 'bg-red-100 text-red-600',
      href: '/orders?status=pending',
    },
  ];

  const getPriceRange = (options: { price: number }[]) => {
    if (options.length === 0) return '-';
    const prices = options.map((o) => o.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? formatPrice(min)
      : `${formatPrice(min)} ~ ${formatPrice(max)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">안녕하세요, 관리자님</h2>
        <p className="mt-1 text-sm text-gray-500">오늘의 농장 현황을 확인해보세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const cardContent = (
            <>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {allProductsQuery.isLoading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
            </>
          );

          return 'href' in stat && stat.href ? (
            <Link key={stat.label} to={stat.href}>
              <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
                {cardContent}
              </Card>
            </Link>
          ) : (
            <Card key={stat.label} className="flex items-center gap-4">
              {cardContent}
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">최근 등록 상품</h3>
          <Link
            to="/products"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            전체 보기
          </Link>
        </div>

        {productsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : productsQuery.data && productsQuery.data.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.data.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name ?? '-'}</TableCell>
                  <TableCell>{getPriceRange(product.options)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[product.status] ?? 'default'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">등록된 상품이 없습니다.</p>
            <Link
              to="/products/new"
              className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              첫 상품 등록하기
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
