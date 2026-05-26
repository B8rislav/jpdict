import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000';

async function getAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${FASTAPI_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const upstream = await fetch(`${FASTAPI_URL}/api/history?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const upstream = await fetch(`${FASTAPI_URL}/api/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  await fetch(`${FASTAPI_URL}/api/history`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new NextResponse(null, { status: 204 });
}
