import { type NextRequest, NextResponse } from 'next/server';
import { toReviewCard } from '@/shared/api/mappers';
import { type BackendReviewCard } from '@/features/Review/api/types';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

/**
 * Suspend and unsuspend differ only by path segment, so they share a handler.
 * (Not a `route.ts`, so the App Router won't mount it as an endpoint.)
 */
export function suspendHandler(action: 'suspend' | 'unsuspend') {
  return async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const call = await backendFetch(req, `/api/review/${id}/${action}`, { method: 'POST' });
    if (call.error) return call.error;

    if (!call.upstream.ok) {
      return NextResponse.json(await call.upstream.json().catch(() => ({})), {
        status: call.upstream.status,
      });
    }

    const card = (await call.upstream.json()) as BackendReviewCard;
    return cacheAccessToken(NextResponse.json(toReviewCard(card)), call);
  };
}
