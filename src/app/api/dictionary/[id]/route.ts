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

interface BackendWord {
  id: string;
  expression: string;
  reading: string;
  meaning: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  status: string;
  added_at: string;
}

function toFrontend(w: BackendWord) {
  const markers: string[] = [];
  if (w.jlpt_level) markers.push(`JLPT N${w.jlpt_level}`);
  if (w.hsk_level) markers.push(`HSK ${w.hsk_level}`);
  return {
    id: w.id,
    kanji_full: w.expression,
    hiragana_full: w.reading,
    def_en: [w.meaning],
    markers,
    savedAt: w.added_at,
    status: w.status,
  };
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await fetch(`${BACKEND_URL}/api/vocabulary/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const upstream = await fetch(`${BACKEND_URL}/api/vocabulary/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status }),
  });

  const word = (await upstream.json()) as BackendWord;
  return NextResponse.json(toFrontend(word));
}
