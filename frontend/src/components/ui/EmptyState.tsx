import type { ReactNode } from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-outline">
        {icon ?? <Package className="h-7 w-7" />}
      </div>
      <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
