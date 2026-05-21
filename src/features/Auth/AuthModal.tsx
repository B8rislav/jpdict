'use client';

import { Button, Modal, Radio, RadioGroup, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { FormEvent, useState } from 'react';

import { loginFx, registerFx } from '@/stores/auth';

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
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  }

  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onOpenChange(false)} className={styles.modal}>
      <div className={styles.content}>
        <Text variant="header-1">{mode === 'login' ? 'Войти' : 'Регистрация'}</Text>

        <RadioGroup
          value={mode}
          onUpdate={(v) => {
            setMode(v as Mode);
            setError('');
          }}
          direction="horizontal"
        >
          <Radio value="login">Войти</Radio>
          <Radio value="register">Зарегистрироваться</Radio>
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
            placeholder="Пароль"
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
              <Radio value="jp">Японский</Radio>
              <Radio value="cn">Китайский</Radio>
            </RadioGroup>
          )}

          {error && (
            <Text variant="body-2" color="danger">
              {error}
            </Text>
          )}

          <Button type="submit" view="action" loading={pending} width="max">
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
