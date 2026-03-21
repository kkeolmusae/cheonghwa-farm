import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white p-6 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
