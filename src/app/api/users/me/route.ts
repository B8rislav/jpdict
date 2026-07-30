import { type NextRequest, NextResponse } from 'next/server';
import {
  PROFILE_COOKIE,
  PROFILE_COOKIE_MAX_AGE,
  serializeProfileCookie,
  toCurrentUser,
  type BackendUser,
} from '@/shared/api/profile';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

/**
 * Identity + profile in one call — what the client uses instead of exchanging
 * the refresh cookie just to learn whether a session exists. A 401 here means
 * "signed out", which is an ordinary answer, not an error.
 *
 * Both handlers re-stamp the profile cookie from the DB response so the next
 * SSR renders what Postgres says, not what this device last wrote.
 */
function withProfileCookie(response: NextResponse, user: ReturnType<typeof toCurrentUser>) {
  response.cookies.set(PROFILE_COOKIE, serializeProfileCookie(user), {
    path: '/',
    sameSite: 'lax',
    maxAge: PROFILE_COOKIE_MAX_AGE,
  });
  return response;
}

export async function GET(req: NextRequest) {
  const call = await backendFetch(req, '/api/users/me');
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const user = toCurrentUser((await call.upstream.json()) as BackendUser);
  return cacheAccessToken(withProfileCookie(NextResponse.json(user), user), call);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const call = await backendFetch(req, '/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const user = toCurrentUser((await call.upstream.json()) as BackendUser);
  return cacheAccessToken(withProfileCookie(NextResponse.json(user), user), call);
}
