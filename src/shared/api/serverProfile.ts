import { cookies, headers } from 'next/headers';

import { detectLocale } from '@/shared/i18n/server';
import { parseProfileCookie, PROFILE_COOKIE, resolveProfile, type UserProfile } from './profile';

/**
 * Resolve the visitor's profile at render time, before any JS runs.
 *
 * Reads only request-local data — no backend call, so it adds nothing to TTFB.
 * The DB copy is authoritative but arrives later, via `/api/users/me` on mount;
 * this is the cached approximation that keeps the first paint correct.
 */
export async function readProfile(): Promise<UserProfile> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  return resolveProfile({
    cookie: parseProfileCookie(cookieStore.get(PROFILE_COOKIE)?.value),
    acceptLanguageLocale: detectLocale(headerList.get('accept-language')),
  });
}
