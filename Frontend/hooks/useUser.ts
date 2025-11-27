// /hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { User } from '@/types/user';

export function useUser() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.request<User>('/user/profile'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) =>
      apiClient.request<User>('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useUpdateTaxInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taxInfo: User['taxInfo']) =>
      apiClient.request<User>('/user/tax-info', {
        method: 'PUT',
        body: JSON.stringify(taxInfo),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      apiClient.request('/user/profile', {
        method: 'DELETE',
      }),
  });
}
