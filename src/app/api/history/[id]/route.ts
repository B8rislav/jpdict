import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  await fetch(`${BACKEND_URL}/api/history/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  return new NextResponse(null, { status: 204 });
}
