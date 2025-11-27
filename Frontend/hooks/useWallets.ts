import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConnectedSource, ConnectionSource } from '@/types/wallet';

export function useConnectedSources() {
  return useQuery({
    queryKey: ['connected-sources'],
    queryFn: () => apiClient.request<ConnectedSource[]>('/wallets/connected'),
  });
}

export function useConnectionSources() {
  return useQuery({
    queryKey: ['connection-sources'],
    queryFn: () => apiClient.request<ConnectionSource[]>('/wallets/sources'),
  });
}

export function useConnectSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sourceId: string; connectionType: string; credentials: Record<string, string> }) =>
      apiClient.request('/wallets/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
    },
  });
}

export function useDisconnectSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) =>
      apiClient.request(`/wallets/disconnect/${sourceId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useResyncSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) =>
      apiClient.request<{ jobId: string; message: string }>(`/wallets/resync/${sourceId}`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
