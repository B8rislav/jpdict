import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';

async function getAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await fetch(`${BACKEND_URL}/api/history/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new NextResponse(null, { status: 204 });
}
