import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchData } from './fetchData';

const jsonResponse = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('fetchData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Drives the retry backoff without waiting on real timers. */
  const run = async <T>(promise: Promise<T>) => {
    const settled = promise.then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    );
    await vi.runAllTimersAsync();
    return settled;
  };

  it('returns parsed JSON on success', async () => {
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(200, { hello: 'world' }));
    const result = await run(fetchData<{ hello: string }>('search'));
    expect(result).toEqual({ ok: true, value: { hello: 'world' } });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry a 404 — three round trips cannot make a word exist', async () => {
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(404, { detail: 'not found' }));

    const result = await run(fetchData('kanji/X'));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect((result.error as ApiError).status).toBe(404);
      expect((result.error as ApiError).isNotFound).toBe(true);
    }
  });

  it('does not retry a 401', async () => {
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(401));
    const result = await run(fetchData('search'));
    expect(fetch).toHaveBeenCalledTimes(1);
    if (!result.ok) expect((result.error as ApiError).isUnauthorized).toBe(true);
  });

  it('retries a 503 and succeeds on a later attempt', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(503))
      .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));

    const result = await run(fetchData('search'));

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true, value: { ok: 1 } });
  });

  it('retries 429, which is an explicit "try again"', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(429))
      .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));
    const result = await run(fetchData('search'));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('retries network failures', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError('network error'))
      .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));
    const result = await run(fetchData('search'));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('gives up after the attempt budget and preserves the real error', async () => {
    // A fresh Response per call: a body can only be read once, so reusing one
    // instance across retries would make later attempts see an empty body.
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(500, { detail: 'boom' }));

    const result = await run(fetchData('search'));

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Not a generic "Max retries exceeded" — the caller can still see a 500.
      expect((result.error as ApiError).status).toBe(500);
      expect((result.error as ApiError).body).toEqual({ detail: 'boom' });
    }
  });
});
