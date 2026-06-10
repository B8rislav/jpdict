import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';
import { toReviewCard } from '@/features/Review/api/mappers';
import { type BackendReviewCard } from '@/features/Review/api/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const upstream = await fetch(`${BACKEND_URL}/api/review/${id}/suspend`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  if (!upstream.ok) {
    return NextResponse.json(await upstream.json(), { status: upstream.status });
  }
  const card = (await upstream.json()) as BackendReviewCard;
  return NextResponse.json(toReviewCard(card));
}
