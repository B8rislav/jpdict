import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

const SAMPLE_TOKENS = [
  { surface_form: 'テスト', pos: '名詞', pos_detail_1: '一般', basic_form: 'テスト' },
];

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/ai-overview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readSSEText(res: Response): Promise<string> {
  return res.text();
}

describe('POST /api/ai-overview', () => {
  beforeEach(() => {
    delete process.env.OPENROUTER_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when sentence is missing', async () => {
    const res = await POST(makeRequest({ tokens: SAMPLE_TOKENS }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when tokens are missing', async () => {
    const res = await POST(makeRequest({ sentence: 'テスト' }));
    expect(res.status).toBe(400);
  });

  it('returns SSE stream with Content-Type text/event-stream', async () => {
    const res = await POST(makeRequest({ sentence: 'テスト', tokens: SAMPLE_TOKENS }));
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('streams mock content when no API key is set', async () => {
    const res = await POST(makeRequest({ sentence: 'テスト', tokens: SAMPLE_TOKENS }));
    const text = await readSSEText(res);
    // Should contain at least one data: line with content
    expect(text).toContain('data: ');
    expect(text).toContain('"content"');
    expect(text).toContain('[DONE]');
  });

  it('mock content contains the sentence text', async () => {
    const res = await POST(makeRequest({ sentence: 'テスト文', tokens: SAMPLE_TOKENS }));
    const text = await readSSEText(res);
    expect(text).toContain('テスト文');
  });

  it('streams OpenRouter response when API key is present', async () => {
    process.env.OPENROUTER_KEY = 'test-key';

    const mockChunk = JSON.stringify({
      choices: [{ delta: { content: 'Hello' } }],
    });
    const sseBody = `data: ${mockChunk}\n\ndata: [DONE]\n\n`;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(sseBody, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }),
      ),
    );

    const res = await POST(makeRequest({ sentence: 'テスト', tokens: SAMPLE_TOKENS }));
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    const text = await readSSEText(res);
    expect(text).toContain('"content":"Hello"');
    expect(text).toContain('[DONE]');
  });

  it('falls back to mock when OpenRouter returns non-ok', async () => {
    process.env.OPENROUTER_KEY = 'test-key';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 500 })));

    const res = await POST(makeRequest({ sentence: 'テスト', tokens: SAMPLE_TOKENS }));
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    const text = await readSSEText(res);
    expect(text).toContain('"content"');
  });
});
