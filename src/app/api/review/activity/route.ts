import { type NextRequest, NextResponse } from 'next/server';
import { toReviewActivity } from '@/shared/api/mappers';
import { type BackendReviewActivity } from '@/features/Review/api/types';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  const language = searchParams.get('language');
  if (language) query.set('language', language);
  // The client's IANA zone decides which day a review belongs to. Forwarded rather
  // than defaulted here: the server has no idea what day it is where the user is.
  const tz = searchParams.get('tz');
  if (tz) query.set('tz', tz);
  const weeks = searchParams.get('weeks');
  if (weeks) query.set('weeks', weeks);

  const call = await backendFetch(req, `/api/review/activity?${query.toString()}`);
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const data = (await call.upstream.json()) as BackendReviewActivity;
  return cacheAccessToken(NextResponse.json(toReviewActivity(data)), call);
}
