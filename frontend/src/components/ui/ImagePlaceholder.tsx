import { Package } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImagePlaceholderProps {
  className?: string;
}

export function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-surface-container-high text-outline',
        className,
      )}
    >
      <Package className="h-10 w-10" />
    </div>
  );
}
