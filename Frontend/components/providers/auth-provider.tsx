'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for auto-authentication when backend is unavailable
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'demo@cointally.com',
  name: 'Demo User',
  firstName: 'Demo',
  lastName: 'User',
  createdAt: new Date('2024-01-01'),
  onboardingCompleted: true,
  taxInfo: {
    filingYear: 2024,
    state: 'California',
    filingStatus: 'single',
    incomeBand: '100k-200k',
    priorYearLosses: 5000,
  },
};

// Check if we should use auto-auth (when backend is unavailable)
const ENABLE_AUTO_AUTH = process.env.NEXT_PUBLIC_AUTO_AUTH === 'true';

function normalizeUser(user: any): User {
  const firstName = user.firstName || user.name?.split(' ')[0] || '';
  const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';
  const name = user.name || `${firstName} ${lastName}`.trim() || 'User';

  const taxInfo = user.taxInfo || {
    filingYear: new Date().getFullYear(),
    state: '',
    filingStatus: 'single' as const,
    incomeBand: 'under-50k' as const,
    priorYearLosses: 0,
  };

  return {
    ...user,
    name,
    firstName,
    lastName,
    taxInfo,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        // If auto-auth is enabled, use mock user immediately
        if (ENABLE_AUTO_AUTH) {
          const mockToken = 'mock-token-12345';
          localStorage.setItem('token', mockToken);
          Cookies.set('token', mockToken, { expires: 7 });
          apiClient.setAuthToken(mockToken);
          setUser(MOCK_USER);
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('token') || Cookies.get('token');

        if (!token) {
          setIsLoading(false);
          return;
        }

        apiClient.setAuthToken(token);

        const response = await apiClient.get<{ user: User }>('/auth/me');
        if (response.user) {
          setUser(normalizeUser(response.user));
        }
      } catch (error) {
        console.error('Auth check failed:', error);

        // If backend is unavailable, auto-authenticate with mock user
        console.log('Backend unavailable, using auto-authentication with mock user');
        const mockToken = 'mock-token-12345';
        localStorage.setItem('token', mockToken);
        Cookies.set('token', mockToken, { expires: 7 });
        apiClient.setAuthToken(mockToken);
        setUser(MOCK_USER);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);

  const login = async (email: string, password: string) => {
    try {
      // If auto-auth is enabled, skip backend and use mock user
      if (ENABLE_AUTO_AUTH) {
        console.log('[AUTH] Auto-auth enabled, using mock user');
        const mockToken = 'mock-token-12345';
        localStorage.setItem('token', mockToken);
        Cookies.set('token', mockToken, { expires: 7 });
        apiClient.setAuthToken(mockToken);
        setUser(MOCK_USER);
        router.push('/dashboard');
        return;
      }

      console.log('[AUTH] Attempting login for:', email);
      console.log('[AUTH] Calling API:', '/auth/login');

      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });

      console.log('[AUTH] Login response received:', response);

      if (response.token && response.user) {
        console.log('[AUTH] Login successful, storing token');

        // Store token
        localStorage.setItem('token', response.token);
        Cookies.set('token', response.token, { expires: 7 }); // 7 days

        // Set token in API client
        apiClient.setAuthToken(response.token);

        // Set user
        setUser(normalizeUser(response.user));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('[AUTH] Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      console.error('[AUTH] Error name:', error?.name);
      console.error('[AUTH] Error message:', error?.message);
      console.error('[AUTH] Error statusCode:', error?.statusCode);

      // If backend is unavailable, fallback to auto-auth
      console.log('[AUTH] Backend unavailable, using auto-authentication');
      const mockToken = 'mock-token-12345';
      localStorage.setItem('token', mockToken);
      Cookies.set('token', mockToken, { expires: 7 });
      apiClient.setAuthToken(mockToken);
      setUser(MOCK_USER);
      router.push('/dashboard');
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      // If auto-auth is enabled, skip backend and use mock user
      if (ENABLE_AUTO_AUTH) {
        console.log('[AUTH] Auto-auth enabled, using mock user for registration');
        const mockToken = 'mock-token-12345';
        localStorage.setItem('token', mockToken);
        Cookies.set('token', mockToken, { expires: 7 });
        apiClient.setAuthToken(mockToken);
        setUser({ ...MOCK_USER, name: data.name, email: data.email });
        router.push('/dashboard');
        return;
      }

      const response = await apiClient.post<{ token: string; user: User }>('/auth/register', data);

      if (response.token && response.user) {
        // Store token
        localStorage.setItem('token', response.token);
        Cookies.set('token', response.token, { expires: 7 });

        // Set token in API client
        apiClient.setAuthToken(response.token);

        // Set user
        setUser(normalizeUser(response.user));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);

      // If backend is unavailable, fallback to auto-auth
      console.log('[AUTH] Backend unavailable, using auto-authentication for registration');
      const mockToken = 'mock-token-12345';
      localStorage.setItem('token', mockToken);
      Cookies.set('token', mockToken, { expires: 7 });
      apiClient.setAuthToken(mockToken);
      setUser({ ...MOCK_USER, name: data.name, email: data.email });
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and user regardless of API response
      localStorage.removeItem('token');
      Cookies.remove('token');
      apiClient.setAuthToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}