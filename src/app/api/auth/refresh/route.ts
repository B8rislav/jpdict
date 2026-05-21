import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 });
  }

  const upstream = await fetch(`${FASTAPI_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refresh_token=${refreshToken}`,
    },
  });

  if (!upstream.ok) {
    const error = await upstream.json().catch(() => ({ detail: 'Token refresh failed' }));
    return NextResponse.json(error, { status: upstream.status });
  }

  const data = await upstream.json();
  return NextResponse.json(data);
}
