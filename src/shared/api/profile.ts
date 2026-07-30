import { type Language } from './types';
import { type Locale } from '../i18n/locale';

/**
 * The user's preferences. Durable copy lives in Postgres (`users`), with a
 * mirror in a cookie so SSR can render the right language on the first byte
 * instead of flashing defaults until `/api/users/me` lands.
 *
 * Resolution order — see `resolveProfile`:
 *   DB (authenticated) → cookie → Accept-Language → defaults
 */
export interface UserProfile {
  selectedLanguage: Language | null;
  showFurigana: boolean;
  showPinyin: boolean;
  uiLocale: Locale;
}

/** Identity + profile, as served by `GET /api/users/me`. */
export interface CurrentUser extends UserProfile {
  id: string;
  email: string;
  name: string | null;
}

export const PROFILE_COOKIE = 'profile';

/** A year — the cookie is a cache, not a session; losing it costs a flash, not data. */
export const PROFILE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEFAULT_PROFILE: UserProfile = {
  selectedLanguage: null,
  showFurigana: true,
  showPinyin: true,
  uiLocale: 'ru',
};

/** The backend's snake_case user payload. */
export interface BackendUser {
  id: string;
  email: string;
  name: string | null;
  language: Language;
  ui_locale: Locale;
  show_furigana: boolean;
  show_pinyin: boolean;
}

export function toCurrentUser(user: BackendUser): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    selectedLanguage: user.language,
    uiLocale: user.ui_locale,
    showFurigana: user.show_furigana,
    showPinyin: user.show_pinyin,
  };
}

/** A profile patch → the backend's snake_case PATCH body. Omitted stays omitted. */
export function toBackendPatch(patch: Partial<UserProfile>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.selectedLanguage !== undefined) body.language = patch.selectedLanguage;
  if (patch.uiLocale !== undefined) body.ui_locale = patch.uiLocale;
  if (patch.showFurigana !== undefined) body.show_furigana = patch.showFurigana;
  if (patch.showPinyin !== undefined) body.show_pinyin = patch.showPinyin;
  return body;
}

/**
 * Parse the profile cookie, tolerating anything. A malformed cookie must never
 * break a render — it degrades to `null` and the caller falls through to the
 * next source in the chain.
 */
export function parseProfileCookie(raw: string | undefined): Partial<UserProfile> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const candidate = parsed as Record<string, unknown>;
    const profile: Partial<UserProfile> = {};

    if (candidate.selectedLanguage === 'jp' || candidate.selectedLanguage === 'cn') {
      profile.selectedLanguage = candidate.selectedLanguage;
    }
    if (candidate.uiLocale === 'ru' || candidate.uiLocale === 'en') {
      profile.uiLocale = candidate.uiLocale;
    }
    if (typeof candidate.showFurigana === 'boolean') profile.showFurigana = candidate.showFurigana;
    if (typeof candidate.showPinyin === 'boolean') profile.showPinyin = candidate.showPinyin;

    return profile;
  } catch {
    return null;
  }
}

export function serializeProfileCookie(profile: UserProfile): string {
  return JSON.stringify({
    selectedLanguage: profile.selectedLanguage,
    uiLocale: profile.uiLocale,
    showFurigana: profile.showFurigana,
    showPinyin: profile.showPinyin,
  });
}

/**
 * Fold the available sources into one profile, most-authoritative first.
 *
 * `acceptLanguageLocale` only seeds a first-time visitor: the moment a
 * preference exists in the cookie or the DB, the browser's language stops
 * being consulted. (A Russian speaker on an English OS must not be forced
 * into an English UI.)
 */
export function resolveProfile(sources: {
  cookie?: Partial<UserProfile> | null;
  acceptLanguageLocale?: Locale;
}): UserProfile {
  const { cookie, acceptLanguageLocale } = sources;
  return {
    selectedLanguage: cookie?.selectedLanguage ?? DEFAULT_PROFILE.selectedLanguage,
    showFurigana: cookie?.showFurigana ?? DEFAULT_PROFILE.showFurigana,
    showPinyin: cookie?.showPinyin ?? DEFAULT_PROFILE.showPinyin,
    uiLocale: cookie?.uiLocale ?? acceptLanguageLocale ?? DEFAULT_PROFILE.uiLocale,
  };
}
