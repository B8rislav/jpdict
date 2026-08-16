import { type NextRequest, NextResponse } from 'next/server';
import { toReviewCard } from '@/shared/api/mappers';
import { type BackendReviewCard } from '@/features/Review/api/types';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  const language = searchParams.get('language');
  if (language) query.set('language', language);
  const limit = searchParams.get('limit');
  if (limit) query.set('limit', limit);
  // Deck scoping — «Учить →» on a deck card studies one deck.
  const cardType = searchParams.get('card_type');
  if (cardType) query.set('card_type', cardType);
  // The day boundary the new-card cap is measured against; see docs/BFF.md.
  const tz = searchParams.get('tz');
  if (tz) query.set('tz', tz);

  const call = await backendFetch(req, `/api/review/queue?${query.toString()}`);
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const cards = (await call.upstream.json()) as BackendReviewCard[];
  return cacheAccessToken(NextResponse.json(cards.map(toReviewCard)), call);
}
