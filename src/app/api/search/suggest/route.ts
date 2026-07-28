import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/shared/api/backend';

/**
 * Public BFF proxy for the search «варианты разбора» parse options.
 * Mirrors `/api/parse-sentence` (no auth) — forwards `q`/`lang`/`def_lang`
 * to the FastAPI `GET /api/search/suggest` and returns `{ options }`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';
  const lang = url.searchParams.get('lang') || 'jp';
  const defLang = url.searchParams.get('def_lang') === 'en' ? 'en' : 'ru';

  if (!q) {
    return NextResponse.json({ options: [] });
  }

  const params = new URLSearchParams({ q, lang, def_lang: defLang });
  const upstream = await fetch(`${BACKEND_URL}/api/search/suggest?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!upstream.ok) {
    return NextResponse.json({ options: [] }, { status: upstream.status });
  }

  const data = await upstream.json();
  return NextResponse.json(data);
}
