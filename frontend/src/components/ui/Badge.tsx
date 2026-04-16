import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * Badge — 청화 농원 2025 Design System
 *
 * variant:
 *   success  — 판매중 / 재고있음
 *   warning  — 주의 / 품절임박
 *   error    — 품절 / 오류
 *   info     — 정보
 *   gold     — 특가 / 추천
 *   terra    — 신상 / 이벤트
 *   default  — 일반 태그
 *
 * size: sm | md
 * dot: true면 앞에 dot indicator 추가
 */

const variants = {
  success: 'bg-green-100   text-green-700',
  warning: 'bg-gold-100    text-gold-800',
  error:   'bg-red-50      text-red-700',
  info:    'bg-blue-50     text-blue-700',
  gold:    'bg-gold-100    text-gold-800',
  terra:   'bg-terra-100   text-terra-700',
  default: 'bg-stone-100   text-stone-700',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide',
        // Size
        size === 'sm'
          ? 'px-2 py-0.5 text-[0.6875rem]'
          : 'px-3 py-1 text-[0.75rem]',
        // Variant
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="block h-1.5 w-1.5 shrink-0 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
