import { type NextRequest, NextResponse } from 'next/server';
import { toSavedWord, toVocabularyPayload, type BackendWord } from '@/shared/api/mappers';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const call = await backendFetch(req, '/api/vocabulary');
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const words = (await call.upstream.json()) as BackendWord[];
  return cacheAccessToken(NextResponse.json(words.map(toSavedWord)), call);
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
