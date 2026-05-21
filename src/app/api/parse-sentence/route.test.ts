import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      }),
  },
}));

import { GET } from './route';

const mockBackendToken = {
  surface: '食べる',
  dictionary_form: '食べる',
  reading: 'タベル',
  pos: '動詞',
  jlpt_level: 5,
  hsk_level: null,
  pinyin: null,
};

describe('GET /api/parse-sentence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty tokens for missing sentence param', async () => {
    const req = new Request('http://localhost/api/parse-sentence');
    const res = await GET(req);
    const body = await res.json();
    expect(body.sentence).toBe('');
    expect(body.tokens).toEqual([]);
  });

  it('returns empty tokens for blank sentence', async () => {
    const req = new Request('http://localhost/api/parse-sentence?sentence=');
    const res = await GET(req);
    const body = await res.json();
    expect(body.tokens).toEqual([]);
  });

  it('returns mapped tokens for a valid Japanese sentence', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          query: '食べる',
          language: 'jp',
          query_type: 'SENTENCE',
          tokens: [mockBackendToken],
          level_breakdown: null,
        }),
      }),
    );

    const sentence = encodeURIComponent('食べる');
    const req = new Request(`http://localhost/api/parse-sentence?sentence=${sentence}`);
    const res = await GET(req);
    const body = await res.json();

    expect(body.sentence).toBe('食べる');
    expect(Array.isArray(body.tokens)).toBe(true);
    expect(body.tokens.length).toBeGreaterThan(0);
    expect(body.tokens[0]).toHaveProperty('surface_form', '食べる');
    expect(body.tokens[0]).toHaveProperty('pos', '動詞');
    expect(body.tokens[0]).toHaveProperty('basic_form', '食べる');
    expect(body.tokens[0]).toHaveProperty('reading', 'タベル');
    expect(body.tokens[0]).toHaveProperty('jlpt_level', 5);
  });

  it('returns empty tokens when backend returns 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400 }),
    );

    const sentence = encodeURIComponent('   ');
    const req = new Request(`http://localhost/api/parse-sentence?sentence=${sentence}`);
    const res = await GET(req);
    const body = await res.json();
    expect(body.tokens).toEqual([]);
  });

  it('maps pinyin as reading for Chinese language', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          query: '你好',
          language: 'cn',
          query_type: 'SENTENCE',
          tokens: [
            {
              surface: '你好',
              dictionary_form: '你好',
              reading: null,
              pos: 'NN',
              jlpt_level: null,
              hsk_level: 1,
              pinyin: 'nǐ hǎo',
            },
          ],
          level_breakdown: null,
        }),
      }),
    );

    const req = new Request(
      `http://localhost/api/parse-sentence?sentence=${encodeURIComponent('你好')}&language=cn`,
    );
    const res = await GET(req);
    const body = await res.json();

    expect(body.tokens[0]).toHaveProperty('reading', 'nǐ hǎo');
    expect(body.tokens[0]).toHaveProperty('hsk_level', 1);
  });
});
