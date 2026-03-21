import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary:
    'bg-gradient-to-r from-primary-500 to-primary-container text-on-primary shadow-ambient hover:brightness-[0.98] active:brightness-95 focus-visible:ring-primary-500',
  secondary:
    'bg-secondary-container text-on-secondary-container shadow-ambient hover:brightness-[0.99] focus-visible:ring-secondary/40',
  ghost:
    'text-primary-500 hover:bg-surface-container-low focus-visible:ring-primary-500/30',
} as const;

const sizes = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-14 px-8 text-base gap-2 rounded-xl',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
