import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from '@/lib/stores/auth.store';
import { apiClient } from '@/lib/api-client';

export function useAuth() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const error = useAuthStore(selectError);

  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const githubLogin = useAuthStore((state) => state.githubLogin);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const handleOAuthCallback = useAuthStore((state) => state.handleOAuthCallback);
  const clearError = useAuthStore((state) => state.clearError);
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    fetchUser,
    githubLogin,
    googleLogin,
    handleOAuthCallback,
    clearError,
    markAuthenticated,
  };
}

export function useUser() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      fetchUser();
    }
  }, [isAuthenticated, user, isLoading, fetchUser]);

  return { user, isLoading };
}

export function useRequireAuth(redirectTo: string = '/login') {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If we already have tokens (e.g., from OAuth redirect), hydrate user before redirecting.
      if (apiClient.isAuthenticated()) {
        fetchUser();
        return;
      }
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, fetchUser]);

  return { isAuthenticated, isLoading };
}

export function useRequireGuest(redirectTo: string = '/dashboard') {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useAuthInit() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    // If tokens are present, fetch user on mount even if store isn't marked authenticated yet.
    if (isAuthenticated || apiClient.isAuthenticated()) {
      fetchUser();
    }
  }, [fetchUser, isAuthenticated]);

  return { init: fetchUser };
}
