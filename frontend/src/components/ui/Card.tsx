import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * Card — 청화 농원 2025 Design System
 *
 * Card         — base container
 * CardHover    — 호버 효과 포함 (product, journal 등)
 * CardHeader   — 카드 상단 영역
 * CardImage    — 이미지 컨테이너 (overflow hidden + aspect ratio)
 * CardBody     — 패딩 있는 콘텐츠 영역
 * CardFooter   — 카드 하단 영역
 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-surface-raised border border-border/60 shadow-card',
        hover && [
          'cursor-pointer',
          'transition-[transform,box-shadow,border-color]',
          'duration-[450ms]',
          'ease-[cubic-bezier(0.4,0,0.2,1)]',
          'hover:-translate-y-1 hover:shadow-card-hover hover:border-border-muted',
        ],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 pt-5 md:px-6 md:pt-6', className)}
      {...props}
    />
  );
}

export function CardImage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative overflow-hidden bg-surface-muted', className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 md:p-6', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 py-5 md:px-6 md:py-6', className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-5 pb-5 pt-0 md:px-6 md:pb-6',
        'border-t border-border/60',
        className,
      )}
      {...props}
    />
  );
}

/**
 * HighlightCard — 브랜드 색상 배경 강조 카드
 * 사용처: 통계, 특징, CTA 블록
 */
export function HighlightCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-forest-200 bg-gradient-to-br from-forest-50 to-forest-100 p-6 md:p-8',
        className,
      )}
      {...props}
    />
  );
}

/**
 * ArticleCard — 저널/공지 리스트 카드
 */
export function ArticleCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      hover
      className={cn('flex flex-col gap-0', className)}
      {...props}
    />
  );
}
