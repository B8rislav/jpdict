import { NextResponse } from 'next/server';
import { PROFILE_COOKIE } from '@/shared/api/profile';
import { clearAccessToken } from '@/shared/api/serverAuth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('refresh_token');
  // The cached access token is keyed to nothing but its own 15-minute expiry,
  // so it would otherwise outlive the session it belongs to.
  clearAccessToken(response);
  // Preferences belong to the signed-out visitor now; drop the departing user's.
  response.cookies.delete(PROFILE_COOKIE);
  return response;
}
