import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { fetchJournals, journalKeys } from '@/api/journals';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { formatDate } from '@/utils/format';

const LIMIT = 9;

export default function JournalListPage() {
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: journalKeys.list({ offset, limit: LIMIT }),
    queryFn: () => fetchJournals({ offset, limit: LIMIT }),
  });

  return (
    <div className="bg-surface-container-low">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 md:px-8 md:py-20">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-tertiary">Journal</p>
        <h1 className="mt-2 font-headline text-4xl font-extrabold text-on-surface">농장일지</h1>
        <p className="mt-3 max-w-xl font-body text-lg text-on-surface-variant">
          농장의 일상과 성장 이야기를 기록합니다
        </p>

        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <div className="mt-16">
            <EmptyState
              title="아직 작성된 일지가 없습니다"
              description="농장일지가 곧 업데이트될 예정입니다."
            />
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((journal) => (
                <Link key={journal.id} to={`/journals/${journal.id}`}>
                  <Card className="group h-full overflow-hidden">
                    <div className="p-2">
                      {journal.primary_image ? (
                        <img
                          src={journal.primary_image.thumbnail_url ?? journal.primary_image.image_url}
                          alt={journal.title}
                          className="aspect-video w-full rounded-lg object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <ImagePlaceholder className="aspect-video w-full rounded-lg" />
                      )}
                    </div>
                    <div className="px-5 pb-6 pt-0">
                      <h3 className="line-clamp-2 font-headline text-lg font-bold text-on-surface">
                        {journal.title}
                      </h3>
                      <p className="mt-2 text-xs text-on-surface-variant">{formatDate(journal.created_at)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-14">
              <Pagination total={data.total} offset={offset} limit={LIMIT} onChange={setOffset} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
