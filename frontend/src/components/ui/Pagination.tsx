import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  total: number;
  offset: number;
  limit: number;
  onChange: (offset: number) => void;
}

export function Pagination({ total, offset, limit, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="페이지네이션">
      <button
        onClick={() => onChange(Math.max(0, offset - limit))}
        disabled={currentPage === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:pointer-events-none disabled:opacity-40"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-outline">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange((page - 1) * limit)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary-500 text-on-primary shadow-ambient'
                : 'text-on-surface hover:bg-surface-container-low',
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(Math.min((totalPages - 1) * limit, offset + limit))}
        disabled={currentPage === totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:pointer-events-none disabled:opacity-40"
        aria-label="다음 페이지"
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
