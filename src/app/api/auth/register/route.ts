import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({ detail: 'Registration failed' }));
  return NextResponse.json(data, { status: upstream.status });
}
