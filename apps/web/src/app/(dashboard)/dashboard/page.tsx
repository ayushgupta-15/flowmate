'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAuth, useUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();
  const { fetchUser } = useAuth();
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

  // Capture tokens placed in the query string (from OAuth redirect), persist them,
  // fetch the user, and then clean up the URL so tokens are not left in the address bar.
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (accessToken && refreshToken && expiresIn) {
      apiClient.saveTokens({
        accessToken,
        refreshToken,
        expiresIn: Number(expiresIn),
      });

      // Mark as authenticated immediately to avoid redirects while we fetch the user.
      markAuthenticated();

      fetchUser();
      router.replace('/dashboard');
    }
  }, [searchParams, router, fetchUser, markAuthenticated]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back, {user?.username}!</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-2">Recent Projects</h3>
          <p className="text-sm text-muted-foreground">No projects yet. Create your first project to get started!</p>
        </div>
      </div>
    </div>
  );
}
