import { createEffect, createEvent, createStore, sample } from 'effector';

import {
  DEFAULT_PROFILE,
  PROFILE_COOKIE,
  PROFILE_COOKIE_MAX_AGE,
  serializeProfileCookie,
  toBackendPatch,
  type CurrentUser,
  type UserProfile,
} from '@/shared/api/profile';
import { type Language } from '@/shared/api/types';
import { type Locale } from '@/shared/i18n';
import { $isAuthenticated, fetchCurrentUserFx } from './auth';

export { type UserProfile } from '@/shared/api/profile';

/**
 * Preferences. Durable copy lives in Postgres; the `profile` cookie mirrors it
 * so SSR renders the right language on the first byte. Nothing here touches
 * localStorage — it can't be read at render time, so it always produced a flash
 * of the wrong language followed by a hydration mismatch.
 */
export const $userProfile = createStore<UserProfile>(DEFAULT_PROFILE);

/** Seed from the server-resolved profile. Fires once, before first paint. */
export const profileHydrated = createEvent<UserProfile>();

export const setSelectedLanguage = createEvent<Language>();
export const setShowFurigana = createEvent<boolean>();
export const setShowPinyin = createEvent<boolean>();
export const setUiLocale = createEvent<Locale>();

/** Any single-field preference change, normalised to a patch. */
const profileChanged = createEvent<Partial<UserProfile>>();

sample({
  clock: setSelectedLanguage,
  fn: (selectedLanguage): Partial<UserProfile> => ({ selectedLanguage }),
  target: profileChanged,
});
sample({
  clock: setShowFurigana,
  fn: (showFurigana): Partial<UserProfile> => ({ showFurigana }),
  target: profileChanged,
});
sample({
  clock: setShowPinyin,
  fn: (showPinyin): Partial<UserProfile> => ({ showPinyin }),
  target: profileChanged,
});
sample({
  clock: setUiLocale,
  fn: (uiLocale): Partial<UserProfile> => ({ uiLocale }),
  target: profileChanged,
});

$userProfile
  .on(profileHydrated, (_, profile) => profile)
  .on(profileChanged, (state, patch) => ({ ...state, ...patch }))
  // The DB is authoritative: a signed-in user's stored profile overrides
  // whatever the cookie carried into this device's render.
  .on(fetchCurrentUserFx.doneData, (state, user: CurrentUser | null) =>
    user
      ? {
          selectedLanguage: user.selectedLanguage,
          showFurigana: user.showFurigana,
          showPinyin: user.showPinyin,
          uiLocale: user.uiLocale,
        }
      : state,
  );

/**
 * Mirror the profile into a cookie the server reads on the next request.
 * Deliberately not httpOnly: it holds no secret, and the client has to write it
 * for signed-out users, who have no row to PATCH.
 */
const writeProfileCookie = (profile: UserProfile) => {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(serializeProfileCookie(profile));
  document.cookie = `${PROFILE_COOKIE}=${value}; path=/; max-age=${PROFILE_COOKIE_MAX_AGE}; samesite=lax`;
};

export const persistProfileFx = createEffect(async (patch: Partial<UserProfile>) => {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toBackendPatch(patch)),
  });
  if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);
  return res.json();
});

// Cookie always; Postgres only when there's a row to write to.
$userProfile.updates.watch(writeProfileCookie);

sample({
  clock: profileChanged,
  source: $isAuthenticated,
  filter: (isAuthenticated) => isAuthenticated,
  fn: (_, patch) => patch,
  target: persistProfileFx,
});

export const $uiLocale = $userProfile.map((profile) => profile.uiLocale);
export const $selectedLanguage = $userProfile.map((profile) => profile.selectedLanguage);
