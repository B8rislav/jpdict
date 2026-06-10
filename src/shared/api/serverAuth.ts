import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from './backend';

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

/**
 * Resolve the backend access token from a BFF request's refresh cookie.
 * Returns `{ token }` on success, or `{ error }` carrying a ready-to-return 401.
 */
export async function requireAccessToken(
  req: NextRequest,
): Promise<{ token: string; error?: undefined } | { token?: undefined; error: NextResponse }> {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    return { error: NextResponse.json({ detail: 'Unauthorized' }, { status: 401 }) };
  }
  const token = await getAccessToken(refreshToken);
  if (!token) {
    return { error: NextResponse.json({ detail: 'Unauthorized' }, { status: 401 }) };
  }
  return { token };
}
