import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';
import { toReviewResult } from '@/features/Review/api/mappers';
import { type BackendReviewResult } from '@/features/Review/api/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const upstream = await fetch(`${BACKEND_URL}/api/review/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ grade: body.grade }),
  });
  if (!upstream.ok) {
    return NextResponse.json(await upstream.json(), { status: upstream.status });
  }
  const result = (await upstream.json()) as BackendReviewResult;
  return NextResponse.json(toReviewResult(result));
}
