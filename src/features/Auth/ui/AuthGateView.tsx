'use client';

import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { type FC } from 'react';

import { useT } from '@/shared/i18n';
import styles from './AuthGateView.module.css';

export type AuthGateViewProps = {
  /** What the visitor needs to sign in for, e.g. "Мой словарь". */
  title: string;
  onSignIn: () => void;
};

/** The sign-in prompt shown in place of gated content. */
export const AuthGateView: FC<AuthGateViewProps> = ({ title, onSignIn }) => {
  const t = useT();

  return (
    <div className={styles.gate}>
      <Text variant="subheader-2">
        {t('ui', 'auth_gate_prompt')} {title}
      </Text>
      <Button variant="primary" size="l" onClick={onSignIn}>
        {t('ui', 'nav_login')}
      </Button>
    </div>
  );
};
