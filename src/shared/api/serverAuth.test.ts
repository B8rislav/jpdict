import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { backendFetch, requireAccessToken } from './serverAuth';

const REFRESH = 'refresh-token-value';

function req(cookies: Record<string, string>): NextRequest {
  const header = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  return new NextRequest('http://localhost:3000/api/dictionary', {
    headers: header ? { Cookie: header } : {},
  });
}

/** How many times the refresh exchange was called. */
const refreshCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/api/auth/refresh')).length;

describe('requireAccessToken', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('401s with no refresh cookie, without calling the backend', async () => {
    const result = await requireAccessToken(req({}));
    expect(result.error?.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('exchanges the refresh cookie when no token is cached', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'minted' }), { status: 200 }),
    );

    const result = await requireAccessToken(req({ refresh_token: REFRESH }));

    expect(result.token).toBe('minted');
    // Flagged fresh so the caller stores it on the response.
    expect(result.freshToken).toBe('minted');
    expect(refreshCalls()).toBe(1);
  });

  it('reuses a cached token and performs NO refresh exchange', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));

    const result = await requireAccessToken(
      req({ refresh_token: REFRESH, access_token: 'cached' }),
    );

    expect(result.token).toBe('cached');
    expect(result.freshToken).toBeUndefined();
    // The whole point: no round trip, no `SELECT` on users.
    expect(refreshCalls()).toBe(0);
  });

  it('401s when the refresh token is rejected', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 401 }));
    const result = await requireAccessToken(req({ refresh_token: 'expired' }));
    expect(result.error?.status).toBe(401);
  });
});

describe('backendFetch', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('attaches the bearer token to the upstream call', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));

    await backendFetch(req({ refresh_token: REFRESH, access_token: 'cached' }), '/api/vocabulary');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain('/api/vocabulary');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer cached');
  });

  it('re-mints once and retries when a CACHED token has gone stale', async () => {
    vi.mocked(fetch)
      // Upstream rejects the cached token…
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      // …the refresh exchange mints a new one…
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'fresh' }), { status: 200 }),
      )
      // …and the retry succeeds.
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const call = await backendFetch(
      req({ refresh_token: REFRESH, access_token: 'stale' }),
      '/api/vocabulary',
    );

    expect(call.error).toBeUndefined();
    expect(call.upstream?.status).toBe(200);
    expect(call.freshToken).toBe('fresh');

    const retry = vi.mocked(fetch).mock.calls[2];
    expect((retry[1]?.headers as Record<string, string>).Authorization).toBe('Bearer fresh');
  });

  it('does not retry a 401 when the token was already freshly minted', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'minted' }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('{}', { status: 401 }));

    const call = await backendFetch(req({ refresh_token: REFRESH }), '/api/vocabulary');

    // A fresh token that upstream still rejects is a real 401, not staleness —
    // retrying would loop.
    expect(call.upstream?.status).toBe(401);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('gives up and clears the cache when re-minting also fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }));

    const call = await backendFetch(
      req({ refresh_token: 'expired', access_token: 'stale' }),
      '/api/vocabulary',
    );

    expect(call.error?.status).toBe(401);
  });
});
