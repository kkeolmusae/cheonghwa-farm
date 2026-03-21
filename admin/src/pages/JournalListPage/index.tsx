import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { listJournals, deleteJournal, journalKeys } from '@/api/journals';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
import { formatDate } from '@/utils/format';

const PAGE_SIZE = 20;

export default function JournalListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const filters = {
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: journalKeys.list(filters),
    queryFn: () => listJournals(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
      toast.success('일지가 삭제되었습니다.');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('일지 삭제에 실패했습니다.');
    },
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Link to="/journals/new">
          <Button>
            <Plus className="h-4 w-4" />
            일지 작성
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
                <TableHead>대표이미지</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((journal) => (
                <TableRow key={journal.id}>
                  <TableCell>
                    {journal.primary_image ? (
                      <img
                        src={journal.primary_image.thumbnail_url || journal.primary_image.image_url}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{journal.title}</TableCell>
                  <TableCell>{formatDate(journal.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/journals/${journal.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteTarget({ id: journal.id, title: journal.title })
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
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">작성된 농장일지가 없습니다.</p>
          <Link to="/journals/new" className="mt-3 inline-block text-sm font-medium text-primary-600">
            첫 일지 작성하기
          </Link>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="일지 삭제"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(String(deleteTarget.id))}
            >
              삭제
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          <strong>{deleteTarget?.title}</strong> 일지를 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  );
}
