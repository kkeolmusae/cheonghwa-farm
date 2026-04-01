import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Pagination — 청화 농원 2025 Design System
 *
 * - 현재 페이지: Forest Green solid 버튼
 * - 비활성 페이지: 투명 + hover 시 연녹색 배경
 * - 이전/다음: 아이콘 버튼, disabled 시 opacity 감소
 */

interface PaginationProps {
  total: number;
  offset: number;
  limit: number;
  onChange: (offset: number) => void;
  className?: string;
}

export function Pagination({
  total,
  offset,
  limit,
  onChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="페이지네이션"
    >
      {/* 이전 버튼 */}
      <button
        onClick={() => onChange(Math.max(0, offset - limit))}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-xl',
          'text-on-subtle transition-colors',
          'hover:bg-surface-muted hover:text-on-surface',
          'disabled:pointer-events-none disabled:opacity-35',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        )}
        style={{ transitionDuration: '180ms' }}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* 페이지 번호 */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex h-10 w-10 items-center justify-center text-sm text-on-subtle select-none"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange((page - 1) * limit)}
            aria-label={`${page}페이지`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-xl',
              'text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              page === currentPage
                ? 'bg-primary text-white shadow-sm font-semibold'
                : 'text-on-surface hover:bg-primary-surface hover:text-primary',
            )}
            style={{ transitionDuration: '180ms' }}
          >
            {page}
          </button>
        ),
      )}

      {/* 다음 버튼 */}
      <button
        onClick={() => onChange(Math.min((totalPages - 1) * limit, offset + limit))}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-xl',
          'text-on-subtle transition-colors',
          'hover:bg-surface-muted hover:text-on-surface',
          'disabled:pointer-events-none disabled:opacity-35',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        )}
        style={{ transitionDuration: '180ms' }}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}
