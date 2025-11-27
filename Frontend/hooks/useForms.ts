// /hooks/useForms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { TaxForm } from '@/types/form';

export function useForms() {
  return useQuery({
    queryKey: ['forms'],
    queryFn: () => apiClient.request<TaxForm[]>('/forms'),
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: ['forms', id],
    queryFn: () => apiClient.request<TaxForm>(`/forms/${id}`),
    enabled: !!id,
  });
}

export function useGenerateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taxYear: number; taxMethod: string }) =>
      apiClient.request<TaxForm>('/forms/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}

export function useEmailForm() {
  return useMutation({
    mutationFn: (formId: string) =>
      apiClient.request(`/forms/${formId}/email`, {
        method: 'POST',
      }),
  });
}

export function useDownloadForm() {
  return useMutation({
    mutationFn: async ({ formId, format = 'pdf' }: { formId: string; format?: string }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/download?format=${format}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `tax-form.${format === 'pdf' ? 'pdf' : 'csv'}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      }

      const blob = await response.blob();
      return { blob, filename };
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formId: string) =>
      apiClient.request(`/forms/${formId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}
