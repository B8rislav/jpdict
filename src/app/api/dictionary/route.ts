import { type NextRequest, NextResponse } from 'next/server';
import {
  toSavedWord,
  toVocabularyPage,
  toVocabularyPayload,
  type BackendVocabularyPage,
  type BackendWord,
} from '@/shared/api/mappers';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

/** Filters forwarded verbatim to FastAPI; anything else the client sends is dropped. */
const FORWARDED_PARAMS = [
  'language',
  'card_type',
  'q',
  'jlpt_level',
  'hsk_level',
  'status',
  'limit',
  'offset',
] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = searchParams.get(key);
    if (value) query.set(key, value);
  }

  const call = await backendFetch(req, `/api/vocabulary?${query.toString()}`);
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const page = (await call.upstream.json()) as BackendVocabularyPage;
  return cacheAccessToken(NextResponse.json(toVocabularyPage(page)), call);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const call = await backendFetch(req, '/api/vocabulary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toVocabularyPayload(body)),
  });
  if (call.error) return call.error;

  if (call.upstream.status === 409) {
    return NextResponse.json({ error: 'Already saved' }, { status: 409 });
  }
  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const word = (await call.upstream.json()) as BackendWord;
  return cacheAccessToken(NextResponse.json(toSavedWord(word), { status: 201 }), call);
}
