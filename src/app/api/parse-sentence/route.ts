import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000';

type BackendToken = {
  surface: string;
  dictionary_form: string | null;
  reading: string | null;
  pos: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  pinyin: string | null;
};

function mapToken(token: BackendToken, language: string) {
  return {
    surface_form: token.surface,
    pos: token.pos,
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: token.dictionary_form ?? token.surface,
    reading: language === 'cn' ? (token.pinyin ?? '') : (token.reading ?? ''),
    pronunciation: language === 'cn' ? (token.pinyin ?? '') : (token.reading ?? ''),
    jlpt_level: token.jlpt_level,
    hsk_level: token.hsk_level,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sentence = url.searchParams.get('sentence')?.trim() || '';
  const language = url.searchParams.get('language') || 'jp';

  if (!sentence) {
    return NextResponse.json({ sentence: '', tokens: [] });
  }

  const upstream = await fetch(`${FASTAPI_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sentence, language }),
    signal: AbortSignal.timeout(10000),
  });

  if (!upstream.ok) {
    if (upstream.status === 400) {
      return NextResponse.json({ sentence, tokens: [] });
    }
    return NextResponse.json({ error: 'Analysis failed' }, { status: upstream.status });
  }

  const data = await upstream.json();
  const tokens = (data.tokens as BackendToken[]).map((t) => mapToken(t, language));

  return NextResponse.json({ sentence, tokens });
}
