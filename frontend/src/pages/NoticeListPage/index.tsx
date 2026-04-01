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
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <div className="heading-group mb-10">
          <span className="eyebrow">Notice</span>
          <h1 className="text-h1 font-headline font-extrabold text-on-bg mt-2">공지사항</h1>
          <p className="mt-3 font-body text-body-lg text-on-muted">
            농장의 소식과 안내사항을 확인하세요
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <EmptyState
            title="아직 공지사항이 없습니다"
            description="새로운 소식이 등록되면 이곳에서 확인할 수 있습니다."
          />
        ) : (
          <>
            <ul className="border-t border-border/50">
              {sorted.map((notice) => (
                <li key={notice.id}>
                  <Link
                    to={`/notices/${notice.id}`}
                    className="group flex items-center justify-between gap-4 border-b border-border/50 py-4 transition-colors hover:text-primary"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {notice.is_pinned && (
                        <Pin className="h-3.5 w-3.5 shrink-0 text-accent-warm" />
                      )}
                      <span
                        className={cn(
                          'truncate text-sm transition-colors group-hover:text-primary',
                          notice.is_pinned ? 'font-bold text-on-bg' : 'font-medium text-on-surface',
                        )}
                      >
                        {notice.title}
                      </span>
                    </span>
                    <time className="shrink-0 text-caption text-on-subtle">
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
