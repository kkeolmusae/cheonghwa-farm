import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  listProducts,
  deleteProduct,
  updateProductStatus,
  productKeys,
} from '@/api/products';
import { fetchCategories, categoryKeys } from '@/api/categories';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
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
import { formatPrice, formatDate } from '@/utils/format';
import type { ProductStatus } from '@/types/product';

const PAGE_SIZE = 20;

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  '판매 예정': 'default',
  '판매 중': 'success',
  '품절': 'danger',
  '판매 종료': 'warning',
};

const allStatuses: ProductStatus[] = ['판매 예정', '판매 중', '품절', '판매 종료'];

const statusFilterOptions = [
  { value: '', label: '전체 상태' },
  ...allStatuses.map((s) => ({ value: s, label: s })),
];

export default function ProductListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const filters = {
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    ...(categoryFilter && { category_id: categoryFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading } = useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => listProducts(filters),
  });

  const { data: categories } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('상품이 삭제되었습니다.');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('상품 삭제에 실패했습니다.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProductStatus }) =>
      updateProductStatus(String(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('상태가 변경되었습니다.');
    },
    onError: () => {
      toast.error('상태 변경에 실패했습니다.');
    },
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const categoryOptions = [
    { value: '', label: '전체 카테고리' },
    ...(categories?.map((c) => ({ value: String(c.id), label: c.name })) ?? []),
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-36"
          />
        </div>
        <Link to="/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            상품 등록
          </Button>
        </Link>
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
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격 범위</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name ?? '-'}</TableCell>
                  <TableCell>{getPriceRange(product.options)}</TableCell>
                  <TableCell>
                    <select
                      value={product.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: product.id,
                          status: e.target.value as ProductStatus,
                        })
                      }
                      className="rounded border border-gray-200 bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Badge
                      variant={statusVariants[product.status] ?? 'default'}
                      className="ml-2"
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteTarget({ id: product.id, name: product.name })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
          <p className="text-gray-500">등록된 상품이 없습니다.</p>
          <Link to="/products/new" className="mt-3 inline-block text-sm font-medium text-primary-600">
            첫 상품 등록하기
          </Link>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="상품 삭제"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              삭제
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          <strong>{deleteTarget?.name}</strong> 상품을 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  );
}
