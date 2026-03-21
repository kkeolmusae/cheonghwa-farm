import { Leaf } from 'lucide-react';

export function PageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Leaf className="h-8 w-8 animate-pulse text-primary-500/60" />
    </div>
  );
}
