import { cn } from '@/lib/utils/cn';
import type { JobStatus } from '@/hooks/useJobMonitor';

interface JobProgressBarProps {
  progress: number;
  status: JobStatus;
  variant?: 'default' | 'compact';
  className?: string;
}

export function JobProgressBar({
  progress,
  status,
  variant = 'default',
  className,
}: JobProgressBarProps) {
  const getColorClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 dark:bg-green-600';
      case 'failed':
        return 'bg-red-500 dark:bg-red-600';
      case 'active':
        return 'bg-primary';
      case 'waiting':
      case 'delayed':
        return 'bg-yellow-500 dark:bg-yellow-600';
      default:
        return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  const height = variant === 'compact' ? 'h-1' : 'h-2';

  return (
    <div
      className={cn('w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden', height, className)}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full transition-all duration-500 ease-out',
          getColorClass()
        )}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
