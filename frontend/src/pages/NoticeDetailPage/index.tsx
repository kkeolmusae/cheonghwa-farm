import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Pin } from 'lucide-react';

import { fetchNotice, noticeKeys } from '@/api/notices';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/utils/format';

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const noticeId = Number(id);

  const { data: notice, isLoading, isError } = useQuery({
    queryKey: noticeKeys.detail(noticeId),
    queryFn: () => fetchNotice(noticeId),
    enabled: !isNaN(noticeId),
  });

  if (isLoading) return <NoticeDetailSkeleton />;

  if (isError || !notice) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <p className="text-on-muted">공지사항을 찾을 수 없습니다.</p>
        <Link
          to="/notices"
          className="mt-4 inline-block font-headline text-sm font-bold text-primary hover:text-primary-dark"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <Link
        to="/notices"
        className="mb-8 inline-flex items-center gap-1 font-headline text-sm font-medium text-on-muted transition-colors hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" />
        공지사항 목록
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          {notice.is_pinned && (
            <Badge variant="warning" className="gap-1 normal-case">
              <Pin className="h-3 w-3" />
              고정
            </Badge>
          )}
        </div>
        <h1 className="mt-3 font-headline text-h1 font-extrabold text-on-bg">
          {notice.title}
        </h1>
        <time className="mt-3 block text-sm text-on-muted">{formatDate(notice.created_at)}</time>
      </header>

      <div className="mt-10 whitespace-pre-line font-body text-body-lg leading-relaxed text-on-muted">
        {notice.content}
      </div>

      <div className="mt-14 border-t border-border/60 pt-10">
        <Link
          to="/notices"
          className="inline-flex items-center gap-1 font-headline text-sm font-bold text-primary hover:text-primary-dark"
        >
          <ChevronLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </div>
    </article>
  );
}

function NoticeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Skeleton className="mb-8 h-5 w-28" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="mt-2 h-10 w-3/4" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
