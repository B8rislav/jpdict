import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';
import { toReviewCard } from '@/features/Review/api/mappers';
import { type BackendReviewCard } from '@/features/Review/api/types';

export async function GET(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  const language = searchParams.get('language');
  if (language) query.set('language', language);
  const limit = searchParams.get('limit');
  if (limit) query.set('limit', limit);

  const upstream = await fetch(`${BACKEND_URL}/api/review/queue?${query.toString()}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  if (!upstream.ok) {
    return NextResponse.json(await upstream.json(), { status: upstream.status });
  }
  const cards = (await upstream.json()) as BackendReviewCard[];
  return NextResponse.json(cards.map(toReviewCard));
}
