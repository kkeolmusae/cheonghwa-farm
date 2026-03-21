import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const variants = {
  success: 'bg-primary-500/15 text-primary-700',
  warning: 'bg-persimmon-100 text-persimmon-800',
  error: 'bg-red-50 text-red-800',
  info: 'bg-blue-50 text-blue-800',
  default: 'bg-surface-container-high text-on-surface-variant',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
