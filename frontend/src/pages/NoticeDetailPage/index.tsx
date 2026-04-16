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

      <div
        className="mt-10 font-body text-body-lg leading-relaxed text-on-muted
          [&_h2]:font-headline [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-on-bg [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:font-headline [&_h3]:text-h4 [&_h3]:font-semibold [&_h3]:text-on-bg [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
          [&_li]:mb-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-on-muted [&_blockquote]:my-4
          [&_strong]:font-bold [&_strong]:text-on-surface
          [&_em]:italic
          [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
          [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-sm"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />

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
