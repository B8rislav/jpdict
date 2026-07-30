import { createEffect, createEvent, createStore, sample } from 'effector';

import { type CurrentUser } from '@/shared/api/profile';
import { type Language } from '@/shared/api/types';
import { type Locale } from '@/shared/i18n';

/**
 * Identity. The browser holds no token of its own: every backend call goes
 * through the BFF, which authenticates with the httpOnly `refresh_token`
 * cookie. "Am I signed in?" is answered by whether `/api/users/me` returns a
 * user — which also supplies the email for the nav and the stored profile.
 *
 * This replaces a `$accessToken` that was fetched on every load, held in
 * memory, never sent anywhere, and read only to compute a boolean.
 */
const $currentUser = createStore<CurrentUser | null>(null);

export const $isAuthenticated = $currentUser.map((user) => user !== null);
export const $user = $currentUser;

/**
 * Whether the session lookup has come back yet. Gates auth-dependent UI so it
 * doesn't flash a signed-out state during the first request — distinct from
 * `$isAuthenticated`, which is false both before and after a negative answer.
 */
export const $sessionResolved = createStore(false);

export const loggedOut = createEvent();

/** Resolve the session. Returns null when signed out — that's not an error. */
export const fetchCurrentUserFx = createEffect(async (): Promise<CurrentUser | null> => {
  const res = await fetch('/api/users/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Session lookup failed: ${res.status}`);
  return (await res.json()) as CurrentUser;
});

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
    return res.json();
  },
);

export const registerFx = createEffect(
  async ({
    email,
    password,
    language,
    uiLocale,
    name,
  }: {
    email: string;
    password: string;
    language: Language;
    uiLocale: Locale;
    name?: string;
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, language, ui_locale: uiLocale, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? 'Registration failed');
    }
    return res.json();
  },
);

export const logoutFx = createEffect(async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
});

$currentUser.on(fetchCurrentUserFx.doneData, (_, user) => user).reset(logoutFx.done, loggedOut);

// Resolved on any settled outcome — a failed lookup still answers the question
// well enough to stop blocking the UI.
$sessionResolved.on(fetchCurrentUserFx.finally, () => true);

// Logging in proves a session exists but says nothing about who owns it — the
// profile lives in Postgres. Pull the authoritative record straight after.
sample({ clock: loginFx.done, target: fetchCurrentUserFx });
