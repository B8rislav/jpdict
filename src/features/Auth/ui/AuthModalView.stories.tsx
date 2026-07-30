import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { AuthModalView, type AuthMode } from './AuthModalView';

const meta: Meta<typeof AuthModalView> = {
  title: 'features/AuthModalView',
  component: AuthModalView,
  args: {
    open: true,
    mode: 'login',
    email: '',
    password: '',
    language: 'jp',
    error: '',
    pending: false,
    onOpenChange: fn(),
    onModeChange: fn(),
    onEmailChange: fn(),
    onPasswordChange: fn(),
    onLanguageChange: fn(),
    onSubmit: fn((event: { preventDefault: () => void }) => event.preventDefault()),
  },
};

export default meta;
type Story = StoryObj<typeof AuthModalView>;

export const Login: Story = {};

/** Register adds the study-language choice. */
export const Register: Story = {
  args: { mode: 'register' },
};

export const Filled: Story = {
  args: { email: 'user@example.com', password: 'correct-horse' },
};

export const WithError: Story = {
  args: { email: 'user@example.com', error: 'Invalid credentials' },
};

/** Submitting: inputs disabled so the form can't be double-sent. */
export const Pending: Story = {
  args: { email: 'user@example.com', password: 'correct-horse', pending: true },
};

/** Interactive: type, switch tabs, and watch the autocomplete hints change. */
const Controlled = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'jp' | 'cn'>('jp');

  return (
    <AuthModalView
      open
      onOpenChange={fn()}
      mode={mode}
      onModeChange={setMode}
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      language={language}
      onLanguageChange={setLanguage}
      error=""
      pending={false}
      onSubmit={(event) => event.preventDefault()}
    />
  );
};

export const Interactive: Story = {
  render: () => <Controlled />,
};
