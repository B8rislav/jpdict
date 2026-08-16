import { type NextRequest, NextResponse } from 'next/server';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

/**
 * Batched "which of these are already saved?" check.
 *
 * Static segment, so it takes precedence over `[id]` — which only serves PATCH and
 * DELETE anyway. Answers for a whole rendered view in one request, replacing the old
 * habit of fetching the user's entire collection just to test membership.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const query = new URLSearchParams();
  const language = searchParams.get('language');
  if (language) query.set('language', language);
  const cardType = searchParams.get('card_type');
  if (cardType) query.set('card_type', cardType);
  for (const expression of searchParams.getAll('expression')) {
    query.append('expression', expression);
  }

  const call = await backendFetch(req, `/api/vocabulary/saved?${query.toString()}`);
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  // `{ saved: string[] }` already matches the client shape — nothing to translate.
  const data = await call.upstream.json();
  return cacheAccessToken(NextResponse.json(data), call);
}
