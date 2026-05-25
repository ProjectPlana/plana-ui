'use client';

import { createContext, useCallback, useContext, useEffect, useRef, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, PlanaSDK } from '@/lib/sdk';
import { queryKeys, useCurrentUserQuery } from '@/lib/queries';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const userQuery = useCurrentUserQuery();
  const lastUserId = useRef<string | null>(null);
  const suppressNextNullToast = useRef(false);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  }, [queryClient]);

  const login = useCallback(async () => {
    try {
      const authedUser = await PlanaSDK.loginWithPopup();
      queryClient.setQueryData(queryKeys.auth.user(), authedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.guilds() });
      toast.success('Successfully logged in with Discord!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      if (
        errorMessage.includes('Popup authentication not supported') ||
        errorMessage.includes('Failed to open popup')
      ) {
        toast.error('Popup blocked. Redirecting to Discord...');
        try {
          await PlanaSDK.loginWithRedirect();
        } catch {
          toast.error('Login failed. Please try again.');
        }
      } else {
        toast.error(errorMessage);
      }
    }
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await PlanaSDK.logout();
    } finally {
      suppressNextNullToast.current = true;
      queryClient.setQueryData(queryKeys.auth.user(), null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.guilds() });
      toast.success('Successfully logged out');
    }
  }, [queryClient]);

  useEffect(() => {
    const currentUserId = userQuery.data?.id ?? null;

    if (!currentUserId && lastUserId.current) {
      if (suppressNextNullToast.current) {
        suppressNextNullToast.current = false;
      } else {
        toast.info('Session expired. Please log in again.');
      }
    }

    lastUserId.current = currentUserId;
  }, [userQuery.data]);

  return (
    <AuthContext.Provider
      value={{
        user: userQuery.data ?? null,
        loading: userQuery.isLoading,
        login,
        logout,
        refreshUser,
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
