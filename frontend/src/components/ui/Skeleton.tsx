import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-surface-container-high', className)}
      {...props}
    />
  );
}
