'use client';

import { useEffect } from 'react';
import { useAuthInit } from '@/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { init } = useAuthInit();

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
