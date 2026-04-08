import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminFetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryKeys,
} from '@/api/categories';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import type { Category } from '@/types/product';

interface EditingRow {
  id: number | null; // null = 새 카테고리
  name: string;
  sort_order: number;
}

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EditingRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: categoryKeys.adminAll,
    queryFn: adminFetchCategories,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: categoryKeys.adminAll });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; sort_order: number }) =>
      createCategory(data),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('카테고리가 추가되었습니다.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? '카테고리 추가에 실패했습니다.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; sort_order?: number } }) =>
      updateCategory(id, data),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('카테고리가 수정되었습니다.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? '카테고리 수정에 실패했습니다.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success('카테고리가 삭제되었습니다.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? '카테고리 삭제에 실패했습니다.';
      toast.error(msg);
      setDeleteTarget(null);
    },
  });

  const handleSave = () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }
    if (editing.id === null) {
      createMutation.mutate({ name, sort_order: editing.sort_order });
    } else {
      updateMutation.mutate({ id: editing.id, data: { name, sort_order: editing.sort_order } });
    }
  };

  const handleAddRow = () => {
    const nextOrder = categories ? categories.length + 1 : 1;
    setEditing({ id: null, name: '', sort_order: nextOrder });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={handleAddRow} disabled={editing?.id === null}>
          <Plus className="h-4 w-4" />
          카테고리 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>카테고리명</TableHead>
              <TableHead className="w-28">정렬 순서</TableHead>
              <TableHead className="w-28 text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((cat, idx) =>
                editing?.id === cat.id ? (
                  /* 수정 중인 행 */
                  <TableRow key={cat.id}>
                    <TableCell className="text-gray-400">{idx + 1}</TableCell>
                    <TableCell>
                      <input
                        autoFocus
                        type="text"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="카테고리명"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        value={editing.sort_order}
                        onChange={(e) =>
                          setEditing({ ...editing, sort_order: Number(e.target.value) })
                        }
                        className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        min={0}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSave}
                          loading={isPending}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(null)}
                          disabled={isPending}
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  /* 일반 행 */
                  <TableRow key={cat.id}>
                    <TableCell className="text-gray-400">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-gray-500">{cat.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditing({ id: cat.id, name: cat.name, sort_order: cat.sort_order })
                          }
                          disabled={!!editing}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(cat)}
                          disabled={!!editing}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              !editing && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-gray-400">
                    <Tag className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p>등록된 카테고리가 없습니다.</p>
                  </TableCell>
                </TableRow>
              )
            )}

            {/* 새 카테고리 추가 행 */}
            {editing?.id === null && (
              <TableRow>
                <TableCell className="text-gray-400">
                  {(categories?.length ?? 0) + 1}
                </TableCell>
                <TableCell>
                  <input
                    autoFocus
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="카테고리명 입력"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: Number(e.target.value) })
                    }
                    className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min={0}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      loading={isPending}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(null)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="카테고리 삭제"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
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
          <strong>{deleteTarget?.name}</strong> 카테고리를 삭제하시겠습니까?
          <br />
          해당 카테고리를 사용하는 상품이 있으면 삭제할 수 없습니다.
        </p>
      </Modal>
    </div>
  );
}
