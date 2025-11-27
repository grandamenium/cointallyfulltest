import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface CSVImportRequest {
  csvContent: string;
  sourceName: string;
  templateName?: string;
}

interface CSVImportResponse {
  imported: number;
  errors: string[];
}

interface CSVTemplatesResponse {
  templates: string[];
}

export function useCSVImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CSVImportRequest) => {
      const response = await apiClient.post<CSVImportResponse>(
        '/transactions/import/csv',
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
    },
  });
}

export function useCSVTemplates() {
  return useQuery({
    queryKey: ['csv-templates'],
    queryFn: async () => {
      const response = await apiClient.get<CSVTemplatesResponse>(
        '/transactions/import/templates'
      );
      return response.templates;
    },
    staleTime: 1000 * 60 * 60,
  });
}
