import { type NextRequest, NextResponse } from 'next/server';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  const language = searchParams.get('language');
  if (language) query.set('language', language);

  const call = await backendFetch(req, `/api/review/stats?${query.toString()}`);
  if (call.error) return call.error;

  // Stats already match the frontend shape (new/due/learned/suspended), so pass through.
  const data = await call.upstream.json();
  return cacheAccessToken(NextResponse.json(data, { status: call.upstream.status }), call);
}
