'use client';

import { Button, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { type ReactNode, useEffect, useState } from 'react';

import { $isAuthenticated, refreshFx } from '@/stores/auth';
import { AuthModal } from './AuthModal';
import { t } from '@/shared/i18n';

import styles from './AuthGate.module.css';

interface AuthGateProps {
  children: ReactNode;
  title: string;
}

export function AuthGate({ children, title }: AuthGateProps) {
  const isAuthenticated = useUnit($isAuthenticated);
  const refreshPending = useUnit(refreshFx.pending);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    refreshFx();
  }, []);

  if (refreshPending) return null;

  if (!isAuthenticated) {
    return (
      <>
        <div className={styles.gate}>
          <Text variant="subheader-2">{t('ui', 'auth_gate_prompt')} {title}</Text>
          <Button view="action" size="l" onClick={() => setAuthOpen(true)}>
            {t('ui', 'nav_login')}
          </Button>
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return <>{children}</>;
}
