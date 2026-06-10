import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  const language = searchParams.get('language');
  if (language) query.set('language', language);

  const upstream = await fetch(`${BACKEND_URL}/api/review/stats?${query.toString()}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  // Stats already match the frontend shape (new/due/learned/suspended), so pass through.
  return NextResponse.json(await upstream.json(), { status: upstream.status });
}
