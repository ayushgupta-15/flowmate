'use client';

import { useRequireGuest } from '@/hooks/use-auth';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { isLoading } = useRequireGuest();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <LoginForm />
    </div>
  );
}
