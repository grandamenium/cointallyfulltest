'use client';

import { useAuth as useAuthContext } from '@/components/providers/auth-provider';
import type { User } from '@/types/user';

export function useAuth() {
  const auth = useAuthContext();

  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: !!auth.user,

    signIn: async (email: string, password: string) => {
      await auth.login(email, password);
      return { user: auth.user, error: null };
    },

    signUp: async (email: string, password: string, firstName: string, lastName: string) => {
      const name = `${firstName} ${lastName}`.trim();
      await auth.register({ name, email, password });
      return { user: auth.user, error: null };
    },

    signOut: async () => {
      await auth.logout();
    },

    resetPassword: async (email: string) => {
      // Password reset not implemented in backend yet
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: 'Password reset not implemented yet' };
    },

    // Check current auth status
    checkAuth: async () => {
      // This is handled by the AuthProvider on mount
      // Just return current state
      return;
    },
  };
}

