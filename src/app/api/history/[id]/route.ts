import { type NextRequest, NextResponse } from 'next/server';
import { backendFetch, cacheAccessToken } from '@/shared/api/serverAuth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const call = await backendFetch(req, `/api/history/${id}`, { method: 'DELETE' });
  if (call.error) return call.error;

  return cacheAccessToken(new NextResponse(null, { status: 204 }), call);
}
