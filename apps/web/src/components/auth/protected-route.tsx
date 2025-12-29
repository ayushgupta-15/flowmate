'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/lib/stores/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { fetchUser } = useAuth();
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const [processingTokens, setProcessingTokens] = useState(false);

  // Handle tokens passed via query string (from OAuth redirect).
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (accessToken && refreshToken && expiresIn) {
      setProcessingTokens(true);
      apiClient.saveTokens({
        accessToken,
        refreshToken,
        expiresIn: Number(expiresIn),
      });

      markAuthenticated();

      fetchUser().finally(() => {
        // Clean URL
        router.replace(pathname);
        setProcessingTokens(false);
      });
    }
  }, [searchParams, router, pathname, fetchUser, markAuthenticated]);

  // If we have tokens in storage but store isn't hydrated yet, fetch user.
  useEffect(() => {
    if (!isAuthenticated && !isLoading && apiClient.isAuthenticated()) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading, fetchUser]);

  // Redirect to login only when we definitively know the user is unauthenticated.
  useEffect(() => {
    if (!processingTokens && !isLoading && !isAuthenticated && !apiClient.isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [processingTokens, isLoading, isAuthenticated, redirectTo, router]);

  if (processingTokens || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
