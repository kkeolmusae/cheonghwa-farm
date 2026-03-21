import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pin } from 'lucide-react';

import { fetchNotices, noticeKeys } from '@/api/notices';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatShortDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const LIMIT = 15;

export default function NoticeListPage() {
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: noticeKeys.list({ offset, limit: LIMIT }),
    queryFn: () => fetchNotices({ offset, limit: LIMIT }),
  });

  const pinned = data?.items.filter((n) => n.is_pinned) ?? [];
  const regular = data?.items.filter((n) => !n.is_pinned) ?? [];
  const sorted = [...pinned, ...regular];

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-tertiary">Notice</p>
        <h1 className="mt-2 font-headline text-4xl font-extrabold text-on-surface">공지사항</h1>
        <p className="mt-3 font-body text-lg text-on-surface-variant">
          농장의 소식과 안내사항을 확인하세요
        </p>

        {isLoading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <div className="mt-16">
            <EmptyState
              title="아직 공지사항이 없습니다"
              description="새로운 소식이 등록되면 이곳에서 확인할 수 있습니다."
            />
          </div>
        ) : (
          <>
            <ul className="mt-12 space-y-3">
              {sorted.map((notice) => (
                <li key={notice.id}>
                  <Link
                    to={`/notices/${notice.id}`}
                    className="flex flex-col gap-1 rounded-xl bg-surface-container-low px-5 py-4 shadow-ambient transition-all hover:shadow-ambient-md sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {notice.is_pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-persimmon-500" />}
                      <span
                        className={cn(
                          'truncate font-headline text-sm',
                          notice.is_pinned ? 'font-bold text-on-surface' : 'font-medium text-on-surface',
                        )}
                      >
                        {notice.title}
                      </span>
                    </span>
                    <time className="shrink-0 text-xs text-on-surface-variant sm:text-right">
                      {formatShortDate(notice.created_at)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-14">
              <Pagination total={data.total} offset={offset} limit={LIMIT} onChange={setOffset} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
