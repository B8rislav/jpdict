import { type NextRequest, NextResponse } from 'next/server';
import { toReviewResult } from '@/shared/api/mappers';
import { type BackendReviewResult } from '@/features/Review/api/types';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const call = await backendFetch(req, `/api/review/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // `elapsed_ms` is forwarded only when the client measured it; the backend
    // clamps it, so nothing here has to trust or bound the number.
    body: JSON.stringify({
      grade: body.grade,
      ...(body.elapsedMs != null ? { elapsed_ms: body.elapsedMs } : {}),
    }),
  });
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const result = (await call.upstream.json()) as BackendReviewResult;
  return cacheAccessToken(NextResponse.json(toReviewResult(result)), call);
}
