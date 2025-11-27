'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { APIError, AuthenticationError } from '@/lib/api/errors';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Web3Provider } from '@/components/providers/web3-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
                return false;
              }
              // Retry up to 3 times for 5xx errors (server errors)
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => {
              // Exponential backoff: 1s, 2s, 4s
              return Math.min(1000 * 2 ** attemptIndex, 30000);
            },
          },
          mutations: {
            onError: (error) => {
              // Global error handler for mutations
              if (error instanceof AuthenticationError) {
                toast({
                  title: 'Authentication Required',
                  description: 'Please log in to continue',
                  variant: 'destructive',
                });

                // Redirect to login
                if (typeof window !== 'undefined') {
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 1000);
                }
                return;
              }

              if (error instanceof APIError) {
                toast({
                  title: 'Error',
                  description: error.message,
                  variant: 'destructive',
                });
                return;
              }

              // Unknown error
              toast({
                title: 'Something went wrong',
                description: 'Please try again later',
                variant: 'destructive',
              });
            },
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Web3Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
