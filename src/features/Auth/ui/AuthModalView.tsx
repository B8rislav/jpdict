'use client';

import { Modal, Radio, RadioGroup, Text, TextInput } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { type FC, type FormEvent } from 'react';

import { type Language } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import styles from './AuthModalView.module.css';

export type AuthMode = 'login' | 'register';

export type AuthModalViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  /** Study language, collected at registration only. */
  language: Language;
  onLanguageChange: (language: Language) => void;
  /** Already-localized error message, or empty for none. */
  error: string;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
};

export const AuthModalView: FC<AuthModalViewProps> = ({
  open,
  onOpenChange,
  mode,
  onModeChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  language,
  onLanguageChange,
  error,
  pending,
  onSubmit,
}) => {
  const t = useT();

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onOpenChange(false)}
      className={styles.modal}
    >
      <div className={styles.content}>
        <Text variant="header-1">
          {mode === 'login' ? t('ui', 'auth_title_login') : t('ui', 'auth_title_register')}
        </Text>

        <RadioGroup
          value={mode}
          onUpdate={(value) => onModeChange(value as AuthMode)}
          direction="horizontal"
        >
          <Radio value="login">{t('ui', 'auth_tab_login')}</Radio>
          <Radio value="register">{t('ui', 'auth_tab_register')}</Radio>
        </RadioGroup>

        <form onSubmit={onSubmit} className={styles.form}>
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onUpdate={onEmailChange}
            disabled={pending}
            autoComplete="email"
          />
          <TextInput
            type="password"
            placeholder={t('ui', 'auth_password')}
            value={password}
            onUpdate={onPasswordChange}
            disabled={pending}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <RadioGroup
              value={language}
              onUpdate={(value) => onLanguageChange(value as Language)}
              direction="horizontal"
            >
              <Radio value="jp">{t('ui', 'lang_jp')}</Radio>
              <Radio value="cn">{t('ui', 'lang_cn')}</Radio>
            </RadioGroup>
          )}

          {error && (
            <Text variant="body-2" color="danger">
              {error}
            </Text>
          )}

          <Button type="submit" variant="primary" disabled={pending} fullWidth>
            {mode === 'login' ? t('ui', 'auth_submit_login') : t('ui', 'auth_submit_register')}
          </Button>
        </form>
      </div>
    </Modal>
  );
};
