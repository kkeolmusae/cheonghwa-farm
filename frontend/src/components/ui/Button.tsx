import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Button — 청화 농원 2025 Design System
 *
 * variant:
 *   primary   — Forest Green solid (메인 CTA)
 *   secondary — Green outline (보조 액션)
 *   accent    — Harvest Gold (특가/강조)
 *   ghost     — 텍스트 only (tertiary)
 *   dark      — 어두운 배경 위 outline
 *
 * size: sm | md | lg | xl
 */

const variants = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md hover:-translate-y-px focus-visible:ring-primary active:scale-[0.97] active:translate-y-0',
  secondary:
    'border-2 border-primary bg-transparent text-primary hover:bg-primary-surface focus-visible:ring-primary active:scale-[0.97]',
  accent:
    'bg-gradient-gold text-stone-900 font-bold shadow-sm hover:brightness-105 hover:shadow-md hover:-translate-y-px focus-visible:ring-gold-500 active:scale-[0.97]',
  ghost:
    'bg-transparent text-on-muted hover:bg-surface-muted hover:text-on-surface focus-visible:ring-border-strong active:scale-[0.97]',
  dark:
    'border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50 focus-visible:ring-white active:scale-[0.97]',
} as const;

const sizes = {
  sm: 'h-9  px-4   text-sm  gap-1.5 rounded-lg',
  md: 'h-11 px-6   text-sm  gap-2   rounded-xl',
  lg: 'h-13 px-8   text-base gap-2.5 rounded-xl',
  xl: 'h-[3.75rem] px-10 text-lg gap-3 rounded-2xl',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  /** icon-only 버튼 (정사각형 비율 강제) */
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, disabled, iconOnly, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center',
          'font-body font-semibold',
          'select-none whitespace-nowrap',
          'transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          // Variant
          variants[variant],
          // Size
          sizes[size],
          // Icon-only override
          iconOnly && 'aspect-square px-0',
          className,
        )}
        style={{
          transitionDuration: '250ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
