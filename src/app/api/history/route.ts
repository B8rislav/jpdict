import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';

export async function GET(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const upstream = await fetch(`${BACKEND_URL}/api/history?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const upstream = await fetch(`${BACKEND_URL}/api/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  await fetch(`${BACKEND_URL}/api/history`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  return new NextResponse(null, { status: 204 });
}
