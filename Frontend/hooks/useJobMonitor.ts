import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';

export interface JobStatusResponse {
  id: string | number;
  status: JobStatus;
  progress: number;
  data: {
    userId: string;
    connectionId: string;
    syncJobId: string;
    startDate: string;
    endDate: string;
  };
  result?: {
    status: string;
    transactionsImported: number;
  };
  failedReason?: string;
}

interface QueueStatsResponse {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await apiClient.get<JobStatusResponse>(`/sync/status/${jobId}`);
      return response;
    },
    enabled: !!jobId,
    refetchInterval: 2500,
    refetchIntervalInBackground: false,
    retry: 1,
    staleTime: 0,
  });
}

export function useJobMonitor(jobId: string | null) {
  const [isActive, setIsActive] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await apiClient.get<JobStatusResponse>(`/sync/status/${jobId}`);
      return response;
    },
    enabled: !!jobId && isActive,
    refetchInterval: 2500,
    refetchIntervalInBackground: false,
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (status) {
      setPollCount((prev) => prev + 1);

      if (status.status === 'completed' || status.status === 'failed') {
        setIsActive(false);
      }

      if (pollCount > 120) {
        setIsActive(false);
      }
    }
  }, [status, pollCount]);

  useEffect(() => {
    if (jobId) {
      setIsActive(true);
      setPollCount(0);
    }
  }, [jobId]);

  return {
    status,
    isLoading,
    error,
    isActive,
    stopPolling: () => setIsActive(false),
    resetPolling: () => {
      setIsActive(true);
      setPollCount(0);
    },
  };
}

export function useQueueStats() {
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: async () => {
      const response = await apiClient.get<QueueStatsResponse>('/sync/stats');
      return response;
    },
    refetchInterval: 5000,
    staleTime: 0,
  });
}
