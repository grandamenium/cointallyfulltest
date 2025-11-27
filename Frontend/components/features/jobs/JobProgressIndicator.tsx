'use client';

import { useEffect } from 'react';
import { useJobMonitor } from '@/hooks/useJobMonitor';
import { JobProgressBar } from './JobProgressBar';
import { JobStatusBadge } from './JobStatusBadge';
import { toast } from 'sonner';

interface JobProgressIndicatorProps {
  jobId: string | null;
  sourceName: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function JobProgressIndicator({
  jobId,
  sourceName,
  onComplete,
  onError,
}: JobProgressIndicatorProps) {
  const { status, isLoading } = useJobMonitor(jobId);

  useEffect(() => {
    if (status) {
      if (status.status === 'completed') {
        toast.success(
          `${sourceName} synced successfully! ${status.result?.transactionsImported || 0} transactions imported.`
        );
        onComplete?.(status.result);
      } else if (status.status === 'failed') {
        const errorMsg = status.failedReason || 'Sync failed';
        toast.error(`${sourceName} sync failed: ${errorMsg}`);
        onError?.(errorMsg);
      }
    }
  }, [status?.status, sourceName, onComplete, onError]);

  if (!jobId || !status) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <JobStatusBadge status="waiting" />
        <JobProgressBar progress={0} status="waiting" variant="compact" />
      </div>
    );
  }

  if (status.status === 'completed') {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <JobStatusBadge status={status.status} progress={status.progress} />
        {status.status === 'active' && (
          <span className="text-xs text-muted-foreground">
            {Math.round(status.progress)}%
          </span>
        )}
      </div>
      <JobProgressBar
        progress={status.progress}
        status={status.status}
        variant="compact"
      />
    </div>
  );
}
