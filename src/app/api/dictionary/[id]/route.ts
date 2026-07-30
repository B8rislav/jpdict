import { type NextRequest, NextResponse } from 'next/server';
import { toSavedWord, type BackendWord } from '@/shared/api/mappers';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const call = await backendFetch(req, `/api/vocabulary/${id}`, { method: 'DELETE' });
  if (call.error) return call.error;

  return cacheAccessToken(new NextResponse(null, { status: 204 }) as NextResponse, call);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  const call = await backendFetch(req, `/api/vocabulary/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (call.error) return call.error;

  if (!call.upstream.ok) {
    return NextResponse.json(await call.upstream.json().catch(() => ({})), {
      status: call.upstream.status,
    });
  }

  const word = (await call.upstream.json()) as BackendWord;
  return cacheAccessToken(NextResponse.json(toSavedWord(word)), call);
}
