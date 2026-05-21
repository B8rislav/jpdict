import { createEffect, createEvent, createStore } from 'effector';

export interface AuthUser {
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}

const $auth = createStore<AuthState>({ accessToken: null, user: null });

export const $isAuthenticated = $auth.map((s) => s.accessToken !== null);
export const $user = $auth.map((s) => s.user);
export const $accessToken = $auth.map((s) => s.accessToken);

export const loggedOut = createEvent();

export const loginFx = createEffect(
  async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? 'Login failed');
    }
    const data = (await res.json()) as { access_token: string };
    return { accessToken: data.access_token, user: { email } };
  },
);

export const registerFx = createEffect(
  async ({
    email,
    password,
    language,
  }: {
    email: string;
    password: string;
    language: 'jp' | 'cn';
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, language }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? 'Registration failed');
    }
    return res.json();
  },
);

export const refreshFx = createEffect(async () => {
  const res = await fetch('/api/auth/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('No session');
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
});

export const logoutFx = createEffect(async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
});

$auth
  .on(loginFx.doneData, (_, payload) => payload)
  .on(refreshFx.doneData, (state, accessToken) => ({ ...state, accessToken }))
  .on(logoutFx.done, () => ({ accessToken: null, user: null }))
  .on(loggedOut, () => ({ accessToken: null, user: null }));
