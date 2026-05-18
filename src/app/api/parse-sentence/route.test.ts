import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server before importing the route
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      }),
  },
}));

// Mock kuromoji to avoid slow dictionary loading
vi.mock('kuromoji', () => ({
  builder: () => ({
    build: (cb: (err: null, tokenizer: { tokenize: (s: string) => unknown[] }) => void) => {
      cb(null, {
        tokenize: (sentence: string) => [
          {
            surface_form: sentence,
            pos: '名詞',
            pos_detail_1: '一般',
            pos_detail_2: '*',
            pos_detail_3: '*',
            conjugated_type: '*',
            conjugated_form: '*',
            basic_form: sentence,
            reading: sentence,
            pronunciation: sentence,
          },
        ],
      });
    },
  }),
}));

import { GET } from './route';

describe('GET /api/parse-sentence', () => {
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

  it('returns tokenized result for a Japanese sentence', async () => {
    const sentence = encodeURIComponent('食べる');
    const req = new Request(`http://localhost/api/parse-sentence?sentence=${sentence}`);
    const res = await GET(req);
    const body = await res.json();
    expect(body.sentence).toBe('食べる');
    expect(Array.isArray(body.tokens)).toBe(true);
    expect(body.tokens.length).toBeGreaterThan(0);
    expect(body.tokens[0]).toHaveProperty('surface_form');
    expect(body.tokens[0]).toHaveProperty('pos');
  });
});
