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

  const sortedImages = [...journal.images].sort((a, b) => a.sort_order - b.sort_order);

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

      <div className="mt-10 whitespace-pre-line font-body text-body-lg leading-relaxed text-on-muted">
        {journal.content}
      </div>

      {sortedImages.length > 0 && (
        <div className="mt-12 space-y-6">
          {sortedImages.map((img) => (
            <img
              key={img.id}
              src={img.image_url}
              alt={journal.title}
              className="w-full rounded-2xl object-cover shadow-sm"
              loading="lazy"
            />
          ))}
        </div>
      )}

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
