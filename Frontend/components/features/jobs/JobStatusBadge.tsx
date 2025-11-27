import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { JobStatus } from '@/hooks/useJobMonitor';
import { Loader2, CheckCircle2, XCircle, Clock, Pause } from 'lucide-react';

interface JobStatusBadgeProps {
  status: JobStatus;
  progress?: number;
  className?: string;
}

export function JobStatusBadge({ status, progress, className }: JobStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: progress !== undefined ? `Syncing... ${Math.round(progress)}%` : 'Syncing...',
          icon: Loader2,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800',
          iconClassName: 'animate-spin',
        };
      case 'completed':
        return {
          label: 'Synced',
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800',
        };
      case 'failed':
        return {
          label: 'Failed',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-200 dark:border-red-800',
        };
      case 'waiting':
      case 'delayed':
        return {
          label: 'Queued',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
        };
      case 'paused':
        return {
          label: 'Paused',
          icon: Pause,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border-gray-200 dark:border-gray-800',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border-gray-200 dark:border-gray-800',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, 'border', className)}>
      <Icon className={cn('mr-1 h-3 w-3', config.iconClassName)} />
      {config.label}
    </Badge>
  );
}
