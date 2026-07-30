import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from './backend';

const ACCESS_COOKIE = 'access_token';

/**
 * Backend access tokens live 15 minutes. Expire the cache slightly early so a
 * token can't lapse in flight between our check and the upstream call.
 */
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const ACCESS_TOKEN_SKEW_SECONDS = 30;

/** Exchange a refresh-token cookie for a short-lived backend access token, or null. */
export async function getAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

type AuthResult =
  | { token: string; freshToken?: string; error?: undefined }
  | { token?: undefined; freshToken?: undefined; error: NextResponse };

/**
 * Resolve the backend access token for a BFF request.
 *
 * Prefers the cached `access_token` cookie, exchanging the refresh token only
 * when it's absent. Without the cache, every protected route re-minted a
 * 15-minute credential on every request — a FastAPI round trip plus a `SELECT`
 * on `users`, thrown away immediately after one call.
 *
 * Returns `{ error }` carrying a ready-to-return 401 when there's no session.
 */
export async function requireAccessToken(req: NextRequest): Promise<AuthResult> {
  const cached = req.cookies.get(ACCESS_COOKIE)?.value;
  if (cached) return { token: cached };

  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    return { error: NextResponse.json({ detail: 'Unauthorized' }, { status: 401 }) };
  }

  const token = await getAccessToken(refreshToken);
  if (!token) {
    return { error: NextResponse.json({ detail: 'Unauthorized' }, { status: 401 }) };
  }
  return { token, freshToken: token };
}

/**
 * Cache a newly minted access token on the outgoing response so later requests
 * skip the refresh exchange. httpOnly — the browser never reads it.
 */
export function cacheAccessToken<T extends NextResponse>(
  response: T,
  auth: { freshToken?: string },
): T {
  if (!auth.freshToken) return response;
  response.cookies.set(ACCESS_COOKIE, auth.freshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS - ACCESS_TOKEN_SKEW_SECONDS,
  });
  return response;
}

/** Drop the cached access token — on logout, or when upstream rejects it. */
export function clearAccessToken<T extends NextResponse>(response: T): T {
  response.cookies.set(ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

export type BackendCall =
  | { upstream: Response; freshToken?: string; error?: undefined }
  | { upstream?: undefined; freshToken?: undefined; error: NextResponse };

/**
 * Authenticated call to FastAPI on behalf of a BFF request.
 *
 * Every protected route needs the same four steps — resolve a token, attach the
 * bearer, handle "no session", and cope with a cached token that expired since
 * it was stored. That last one is what makes the cache safe: on a 401 from a
 * *cached* token we re-mint once and retry, so a stale cookie degrades into one
 * extra round trip rather than a spurious logout.
 */
export async function backendFetch(
  req: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<BackendCall> {
  const auth = await requireAccessToken(req);
  if (auth.error) return { error: auth.error };

  const call = (token: string) =>
    fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });

  const upstream = await call(auth.token);

  // A cached token that upstream rejects is stale, not invalid — re-mint once.
  if (upstream.status === 401 && !auth.freshToken) {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    const minted = refreshToken ? await getAccessToken(refreshToken) : null;
    if (!minted) {
      return {
        error: clearAccessToken(NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })),
      };
    }
    return { upstream: await call(minted), freshToken: minted };
  }

  return { upstream, freshToken: auth.freshToken };
}
