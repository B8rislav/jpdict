import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';
import { requireAccessToken } from '@/shared/api/serverAuth';

interface BackendWord {
  id: string;
  expression: string;
  reading: string;
  meaning: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  status: string;
  added_at: string;
  suspended?: boolean;
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
    suspended: w.suspended ?? false,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const upstream = await fetch(`${BACKEND_URL}/api/vocabulary`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  const words = (await upstream.json()) as BackendWord[];
  return NextResponse.json(words.map(toFrontend));
}

export async function POST(req: NextRequest) {
  const auth = await requireAccessToken(req);
  if (auth.error) return auth.error;

  const body = await req.json();

  const jlptMatch = (body.markers as string[] | undefined)?.find((m: string) =>
    m.startsWith('JLPT N'),
  );
  const hskMatch = (body.markers as string[] | undefined)?.find((m: string) =>
    m.startsWith('HSK '),
  );

  const payload = {
    language: body.language ?? 'jp',
    expression: body.kanji_full ?? body.hiragana_full ?? '',
    reading: body.hiragana_full ?? '',
    meaning: (body.def_en?.[0] ?? body.def_ru?.[0] ?? body.def_en ?? '').toString(),
    jlpt_level: jlptMatch ? parseInt(jlptMatch.slice(6)) || null : null,
    hsk_level: hskMatch ? parseInt(hskMatch.slice(4)) || null : null,
    status: 'new',
  };

  const upstream = await fetch(`${BACKEND_URL}/api/vocabulary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(payload),
  });

  if (upstream.status === 409)
    return NextResponse.json({ error: 'Already saved' }, { status: 409 });
  const word = (await upstream.json()) as BackendWord;
  return NextResponse.json(toFrontend(word), { status: 201 });
}
