'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/providers/query-provider';
import type { ReactNode } from 'react';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
}
