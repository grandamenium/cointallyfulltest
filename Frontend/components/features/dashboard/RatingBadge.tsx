'use client';

import { ProgressRing } from '@/components/ui/ProgressRing';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  rating: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const getColor = (r: number) => {
    if (r < 50) return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900';
    if (r < 85) return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900';
    if (r < 100) return 'text-green-500 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900';
    return 'text-green-600 bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700';
  };

  const getLabel = (r: number) => {
    if (r < 50) return 'Needs Work';
    if (r < 85) return 'Getting There';
    if (r < 100) return 'Almost Ready';
    return 'Ready to File';
  };

  const getRingSize = () => {
    if (size === 'sm') return 80;
    if (size === 'lg') return 160;
    return 120; // md
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border px-4 py-3',
        getColor(rating),
        size === 'sm' && 'px-3 py-2',
        size === 'lg' && 'px-6 py-4'
      )}
    >
      <ProgressRing percentage={rating} size={getRingSize()} />
      <div className="flex-1">
        <div className="flex flex-col">
          <span className={cn('font-medium', size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base')}>
            {getLabel(rating)}
          </span>
          <span className={cn('text-xs text-muted-foreground mt-1')}>
            Categorization progress
          </span>
        </div>
      </div>
    </div>
  );
}
