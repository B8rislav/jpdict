import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const upstream = await fetch(`${FASTAPI_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // FastAPI's UserCreate requires language even though login doesn't use it
    body: JSON.stringify({ email, password, language: 'jp' }),
  });

  if (!upstream.ok) {
    const error = await upstream.json().catch(() => ({ detail: 'Login failed' }));
    return NextResponse.json(error, { status: upstream.status });
  }

  const data = await upstream.json();
  const response = NextResponse.json(data);

  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }

  return response;
}
