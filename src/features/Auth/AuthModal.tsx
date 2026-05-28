'use client';

import { Button, Modal, Radio, RadioGroup, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { type FormEvent, useState } from 'react';

import { loginFx, registerFx } from '@/stores/auth';
import { t } from '@/shared/i18n';

import styles from './AuthModal.module.css';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = 'login' | 'register';

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'jp' | 'cn'>('jp');
  const [error, setError] = useState('');

  const loginPending = useUnit(loginFx.pending);
  const registerPending = useUnit(registerFx.pending);
  const pending = loginPending || registerPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await loginFx({ email, password });
        onOpenChange(false);
      } else {
        await registerFx({ email, password, language });
        await loginFx({ email, password });
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ui', 'auth_error_default'));
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onOpenChange(false)}
      className={styles.modal}
    >
      <div className={styles.content}>
        <Text variant="header-1">{mode === 'login' ? t('ui', 'auth_title_login') : t('ui', 'auth_title_register')}</Text>

        <RadioGroup
          value={mode}
          onUpdate={(v) => {
            setMode(v as Mode);
            setError('');
          }}
          direction="horizontal"
        >
          <Radio value="login">{t('ui', 'auth_tab_login')}</Radio>
          <Radio value="register">{t('ui', 'auth_tab_register')}</Radio>
        </RadioGroup>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onUpdate={setEmail}
            disabled={pending}
            autoComplete="email"
          />
          <TextInput
            type="password"
            placeholder={t('ui', 'auth_password')}
            value={password}
            onUpdate={setPassword}
            disabled={pending}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <RadioGroup
              value={language}
              onUpdate={(v) => setLanguage(v as 'jp' | 'cn')}
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

          <Button type="submit" view="action" loading={pending} width="max">
            {mode === 'login' ? t('ui', 'auth_submit_login') : t('ui', 'auth_submit_register')}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
