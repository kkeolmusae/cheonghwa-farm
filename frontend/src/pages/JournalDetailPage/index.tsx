import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';

import { fetchJournal, journalKeys } from '@/api/journals';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/utils/format';

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const journalId = Number(id);

  const { data: journal, isLoading, isError } = useQuery({
    queryKey: journalKeys.detail(journalId),
    queryFn: () => fetchJournal(journalId),
    enabled: !isNaN(journalId),
  });

  if (isLoading) return <JournalDetailSkeleton />;

  if (isError || !journal) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <p className="text-on-muted">일지를 찾을 수 없습니다.</p>
        <Link
          to="/journals"
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
        to="/journals"
        className="mb-8 inline-flex items-center gap-1 font-headline text-sm font-medium text-on-muted transition-colors hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" />
        농장일지 목록
      </Link>

      <header>
        <h1 className="font-headline text-h1 font-extrabold text-on-bg">{journal.title}</h1>
        <time className="mt-3 block text-sm text-on-muted">{formatDate(journal.created_at)}</time>
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
        dangerouslySetInnerHTML={{ __html: journal.content }}
      />

      <div className="mt-14 border-t border-border/60 pt-10">
        <Link
          to="/journals"
          className="inline-flex items-center gap-1 font-headline text-sm font-bold text-primary hover:text-primary-dark"
        >
          <ChevronLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </div>
    </article>
  );
}

function JournalDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Skeleton className="mb-8 h-5 w-28" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-10 aspect-video w-full rounded-2xl" />
    </div>
  );
}
