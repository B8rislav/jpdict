import { SignJWT } from 'jose';
import { http, HttpResponse, type RequestHandler } from 'msw';

import { BACKEND_URL } from '@/shared/api/backend';
import { type Grade } from '@/features/Review/constants';
import { db } from './db';
import { cnLexicon, jpLexicon, type LexiconEntry } from './fixtures';

/**
 * MSW handlers for the mock backend, matched against `${BACKEND_URL}/api/*` — the
 * exact upstream URLs the BFF route handlers fetch (see docs/BFF.md). They speak the
 * backend's snake_case contract; the BFF does the camelCase translation. Backed by
 * the in-memory store in db.ts so add/delete/grade flows persist across navigation.
 */

const u = (path: string) => `${BACKEND_URL}${path}`;

/**
 * Mint a refresh token. Nothing on the frontend verifies its signature any more
 * — the Next middleware that did was deleted along with `JWT_SECRET`, since it
 * duplicated the backend's own check and forced the signing secret into a
 * second repo. The value only has to look like a JWT and round-trip.
 */
const MOCK_SECRET = new TextEncoder().encode('mock-refresh-secret-not-verified-anywhere');

async function mintRefreshToken(email: string): Promise<string> {
  return new SignJWT({ sub: email, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(MOCK_SECRET);
}

/** The signed-in user the mock backend serves from `/api/users/me`. */
const mockUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'mock@user.dev',
  name: 'Mock User',
  language: 'jp',
  ui_locale: 'ru',
  show_furigana: true,
  show_pinyin: true,
  created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
};

// ── Analyzer: longest-match segmentation over the demo lexicons ─────────────────

type BackendToken = {
  surface: string;
  dictionary_form: string | null;
  reading: string | null;
  pos: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  pinyin: string | null;
};

function tokenize(query: string, language: string): BackendToken[] {
  const lexicon = language === 'cn' ? cnLexicon : jpLexicon;
  const tokens: BackendToken[] = [];
  const maxLen = 4;
  let i = 0;
  while (i < query.length) {
    if (/\s/.test(query[i])) {
      i += 1;
      continue;
    }
    let matched: { surface: string; entry: LexiconEntry } | null = null;
    for (let len = Math.min(maxLen, query.length - i); len >= 1; len -= 1) {
      const surface = query.slice(i, i + len);
      if (lexicon[surface]) {
        matched = { surface, entry: lexicon[surface] };
        break;
      }
    }
    if (matched) {
      tokens.push({ surface: matched.surface, ...matched.entry });
      i += matched.surface.length;
    } else {
      // Unknown character → a bare single-char token so the UI still renders it.
      const surface = query[i];
      tokens.push({
        surface,
        dictionary_form: surface,
        reading: language === 'cn' ? null : surface,
        pos: language === 'cn' ? 'unknown' : '未知語',
        jlpt_level: null,
        hsk_level: null,
        pinyin: language === 'cn' ? surface : null,
      });
      i += 1;
    }
  }
  return tokens;
}

// ── OpenRouter SSE stub (keeps dev:mock fully offline even with OPENROUTER_KEY set) ──

function openRouterStream(): ReadableStream {
  const encoder = new TextEncoder();
  const chunks = [
    '1. Общий смысл: ',
    'это демонстрационный разбор от мок-бэкенда. ',
    '2. Грамматика: ',
    'предложение приведено для проверки UI без OpenRouter.',
  ];
  return new ReadableStream({
    start(controller) {
      for (const content of chunks) {
        const payload = { choices: [{ delta: { content } }] };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export const handlers: RequestHandler[] = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  http.post(u('/api/auth/login'), async ({ request }) => {
    const { email } = (await request.json()) as { email?: string };
    const refreshToken = await mintRefreshToken(email ?? 'mock@user.dev');
    return HttpResponse.json(
      { access_token: 'mock-access-token', token_type: 'bearer' },
      {
        headers: { 'Set-Cookie': `refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax` },
      },
    );
  }),

  http.post(u('/api/auth/register'), async ({ request }) => {
    const { email } = (await request.json()) as { email?: string };
    return HttpResponse.json({ id: crypto.randomUUID(), email }, { status: 201 });
  }),

  http.post(u('/api/auth/refresh'), () =>
    HttpResponse.json({ access_token: 'mock-access-token', token_type: 'bearer' }),
  ),

  // ── Current user (identity + profile) ─────────────────────────────────────
  http.get(u('/api/users/me'), ({ request }) =>
    request.headers.get('Authorization')
      ? HttpResponse.json(mockUser)
      : HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 }),
  ),

  http.patch(u('/api/users/me'), async ({ request }) => {
    if (!request.headers.get('Authorization')) {
      return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }
    // Mirrors the backend's exclude_unset semantics: only supplied keys change.
    Object.assign(mockUser, (await request.json()) as Partial<typeof mockUser>);
    return HttpResponse.json(mockUser);
  }),

  // ── Analyze ───────────────────────────────────────────────────────────────
  http.post(u('/api/analyze'), async ({ request }) => {
    const { query, language } = (await request.json()) as { query?: string; language?: string };
    return HttpResponse.json({ tokens: tokenize(query ?? '', language ?? 'jp') });
  }),

  // ── Vocabulary ──────────────────────────────────────────────────────────────
  http.get(u('/api/vocabulary'), () => HttpResponse.json(db.listVocabulary())),

  http.post(u('/api/vocabulary'), async ({ request }) => {
    const payload = (await request.json()) as Parameters<typeof db.addVocabulary>[0];
    const word = db.addVocabulary(payload);
    if (!word) return HttpResponse.json({ detail: 'Already saved' }, { status: 409 });
    return HttpResponse.json(word, { status: 201 });
  }),

  http.delete(u('/api/vocabulary/:id'), ({ params }) => {
    db.deleteVocabulary(params.id as string);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(u('/api/vocabulary/:id'), async ({ params, request }) => {
    const { status } = (await request.json()) as { status: string };
    const word = db.setVocabularyStatus(params.id as string, status);
    if (!word) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(word);
  }),

  // ── History ───────────────────────────────────────────────────────────────
  http.get(u('/api/history'), ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    return HttpResponse.json(
      db.listHistory(url.searchParams.get('lang'), limit ? Number(limit) : null),
    );
  }),

  http.post(u('/api/history'), async ({ request }) => {
    const payload = (await request.json()) as {
      language: 'jp' | 'cn';
      query: string;
      query_type: string;
    };
    return HttpResponse.json(db.addHistory(payload), { status: 201 });
  }),

  http.delete(u('/api/history/:id'), ({ params }) => {
    db.deleteHistory(params.id as string);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(u('/api/history'), () => {
    db.clearHistory();
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Review (SRS) ────────────────────────────────────────────────────────────
  http.get(u('/api/review/queue'), ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    return HttpResponse.json(
      db.reviewQueue(url.searchParams.get('language'), limit ? Number(limit) : null),
    );
  }),

  http.get(u('/api/review/stats'), ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json(db.reviewStats(url.searchParams.get('language')));
  }),

  http.post(u('/api/review/:id/suspend'), ({ params }) => {
    const card = db.setReviewSuspended(params.id as string, true);
    if (!card) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(card);
  }),

  http.post(u('/api/review/:id/unsuspend'), ({ params }) => {
    const card = db.setReviewSuspended(params.id as string, false);
    if (!card) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(card);
  }),

  http.post(u('/api/review/:id'), async ({ params, request }) => {
    const { grade } = (await request.json()) as { grade: Grade };
    const result = db.gradeReviewCard(params.id as string, grade);
    if (!result) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(result);
  }),

  // ── OpenRouter (optional; keeps AI overview offline) ─────────────────────────
  http.post(
    'https://openrouter.ai/api/v1/chat/completions',
    () =>
      new HttpResponse(openRouterStream(), {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      }),
  ),
];
