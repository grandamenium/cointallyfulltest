import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Transaction, PaginatedResponse } from '@/types/transaction';

export interface TransactionFilters {
  sourceId?: string;
  category?: string;
  type?: string;
}

export function useTransactions(filters?: TransactionFilters & { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.sourceId) params.append('sourceId', filters.sourceId);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/transactions?${queryString}` : '/transactions';

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await apiClient.request<PaginatedResponse<Transaction>>(url);
      return response.data;
    },
  });
}

export function useTransactionsPaginated(filters?: TransactionFilters & { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.sourceId) params.append('sourceId', filters.sourceId);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/transactions?${queryString}` : '/transactions';

  return useQuery({
    queryKey: ['transactions-paginated', filters],
    queryFn: () => apiClient.request<PaginatedResponse<Transaction>>(url),
  });
}

export function useInfiniteTransactions(filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ['transactions-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (filters?.sourceId) params.append('sourceId', filters.sourceId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      params.append('page', pageParam.toString());
      params.append('limit', '50');

      const url = `/transactions?${params.toString()}`;
      return apiClient.request<PaginatedResponse<Transaction>>(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

export interface UpdateTransactionData {
  id: string;
  date?: string;
  type?: string;
  asset?: string;
  amount?: number;
  valueUsd?: number | null;
  fee?: number | null;
  feeUsd?: number | null;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  category?: string;
  description?: string;
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTransactionData) => {
      const { id, ...updateData } = data;
      const response = await apiClient.request<{ success: boolean; data: Transaction }>(`/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-infinite'] });
    },
  });
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; category: string; description?: string }) => {
      const response = await apiClient.request<{ success: boolean; data: Transaction }>(`/transactions/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-infinite'] });
    },
  });
}

export function useBulkCategorizeTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      transactionIds?: string[];
      categorizeAllUncategorized?: boolean;
      category: string;
      description?: string;
    }) =>
      apiClient.request('/transactions/bulk-categorize', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
    },
  });
}

export interface TransactionSummary {
  totalGains: number;
  totalLosses: number;
  netGainLoss: number;
  estimatedTax: number;
  shortTermGains: number;
  shortTermLosses: number;
  longTermGains: number;
  longTermLosses: number;
  transactionCount: number;
  taxableEventsCount?: number;
  taxYear: number;
}

export function useTransactionSummary(year: number) {
  return useQuery({
    queryKey: ['transaction-summary', year],
    queryFn: async () => {
      const response = await apiClient.request<TransactionSummary>(`/transactions/summary?year=${year}`);
      return response;
    },
  });
}

export function useTransactionSummaryWithMethod(year: number, method: string) {
  return useQuery({
    queryKey: ['transaction-summary', year, method],
    queryFn: async () => {
      const response = await apiClient.request<TransactionSummary>(
        `/transactions/summary?year=${year}&method=${method}`
      );
      return response;
    },
  });
}

export interface TransactionStats {
  totalCount: number;
  categorizedCount: number;
  uncategorizedCount: number;
  categorizationRate: number;
}

export function useTransactionStats() {
  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      const response = await apiClient.request<TransactionStats>('/transactions/stats');
      return response;
    },
  });
}

export interface PnLDataPoint {
  date: string;
  pnl: number;
  cumulativePnl: number;
}

export interface PnLHistoryResponse {
  dataPoints: PnLDataPoint[];
  totalPnl: number;
  startDate: string | null;
  endDate: string | null;
  taxYear: number;
  method: string;
}

export function usePnLHistory(year?: number, method?: string) {
  return useQuery({
    queryKey: ['pnl-history', year, method],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (method) params.append('method', method);
      const queryString = params.toString();
      const url = queryString ? `/transactions/pnl-history?${queryString}` : '/transactions/pnl-history';
      return apiClient.request<PnLHistoryResponse>(url);
    },
  });
}
