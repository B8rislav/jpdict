import { type NextRequest, NextResponse } from 'next/server';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const call = await backendFetch(req, `/api/history?${searchParams.toString()}`);
  if (call.error) return call.error;

  const data = await call.upstream.json();
  return cacheAccessToken(NextResponse.json(data, { status: call.upstream.status }), call);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const call = await backendFetch(req, '/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (call.error) return call.error;

  const data = await call.upstream.json();
  return cacheAccessToken(NextResponse.json(data, { status: call.upstream.status }), call);
}

export async function DELETE(req: NextRequest) {
  const call = await backendFetch(req, '/api/history', { method: 'DELETE' });
  if (call.error) return call.error;

  return cacheAccessToken(new NextResponse(null, { status: 204 }), call);
}
