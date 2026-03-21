import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Megaphone, Pin } from 'lucide-react';
import toast from 'react-hot-toast';
import { listNotices, deleteNotice, noticeKeys } from '@/api/notices';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

export default function NoticeListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const filters = {
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: noticeKeys.list(filters),
    queryFn: () => listNotices(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success('공지가 삭제되었습니다.');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('공지 삭제에 실패했습니다.');
    },
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Link to="/notices/new">
          <Button>
            <Plus className="h-4 w-4" />
            공지 작성
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
                <TableHead>제목</TableHead>
                <TableHead>고정 여부</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {notice.is_pinned && (
                        <Pin className="h-3.5 w-3.5 text-primary-600" />
                      )}
                      {notice.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {notice.is_pinned ? (
                      <Badge variant="success">고정</Badge>
                    ) : (
                      <Badge variant="default">일반</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(notice.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/notices/${notice.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteTarget({ id: notice.id, title: notice.title })
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
          <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">등록된 공지사항이 없습니다.</p>
          <Link to="/notices/new" className="mt-3 inline-block text-sm font-medium text-primary-600">
            첫 공지 작성하기
          </Link>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="공지 삭제"
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
          <strong>{deleteTarget?.title}</strong> 공지를 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  );
}
