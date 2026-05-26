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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await fetch(`${FASTAPI_URL}/api/history/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new NextResponse(null, { status: 204 });
}
