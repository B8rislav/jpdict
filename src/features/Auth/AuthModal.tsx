'use client';

import { useUnit } from 'effector-react';
import { type FormEvent, useState } from 'react';

import { type Language } from '@/shared/api/types';
import { useLocale, useT } from '@/shared/i18n';
import { loginFx, registerFx } from '@/stores/auth';
import { AuthModalView, type AuthMode } from './ui/AuthModalView';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const t = useT();
  const uiLocale = useLocale();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<Language>('jp');
  const [error, setError] = useState('');

  // Both must be subscribed unconditionally — `||` would short-circuit the
  // second hook and break hook ordering between renders.
  const loginPending = useUnit(loginFx.pending);
  const registerPending = useUnit(registerFx.pending);
  const pending = loginPending || registerPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'register') {
        // Seed the new account from the locale they signed up in, so a choice
        // made before registering survives into the stored profile.
        await registerFx({ email, password, language, uiLocale });
      }
      await loginFx({ email, password });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ui', 'auth_error_default'));
    }
  }

  return (
    <AuthModalView
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      onModeChange={(next) => {
        setMode(next);
        setError('');
      }}
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      language={language}
      onLanguageChange={setLanguage}
      error={error}
      pending={pending}
      onSubmit={handleSubmit}
    />
  );
}
