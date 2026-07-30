'use client';

import { useUnit } from 'effector-react';
import { type ReactNode, useState } from 'react';

import { $isAuthenticated, $sessionResolved } from '@/stores/auth';
import { AuthModal } from './AuthModal';
import { AuthGateView } from './ui/AuthGateView';

interface AuthGateProps {
  children: ReactNode;
  title: string;
}

export function AuthGate({ children, title }: AuthGateProps) {
  const isAuthenticated = useUnit($isAuthenticated);
  const sessionResolved = useUnit($sessionResolved);
  const [authOpen, setAuthOpen] = useState(false);

  // The session is resolved once, by Providers. This used to fire its own
  // `refreshFx()` on mount, racing the identical call in `page.tsx`.
  if (!sessionResolved) return null;

  if (!isAuthenticated) {
    return (
      <>
        <AuthGateView title={title} onSignIn={() => setAuthOpen(true)} />
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return <>{children}</>;
}
