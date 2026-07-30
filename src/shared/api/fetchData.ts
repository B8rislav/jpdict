import { BACKEND_URL } from './backend';

/** Carries the upstream status so callers can tell "not found" from "backend down". */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** Client errors are the request's own fault and won't fix themselves on retry. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

const DEFAULT_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 8000;
const BASE_BACKOFF_MS = 300;

/** Transient conditions worth another attempt. 408/429 are an explicit "try again". */
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) return RETRYABLE_STATUSES.has(error.status);
  // No response at all — network failure or timeout.
  return true;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch JSON from the backend, retrying only what retrying can fix.
 *
 * The previous version retried every error — three round trips to re-confirm a
 * 404 — with no backoff, and replaced the original with a bare "Max retries
 * exceeded", so callers could never tell "no such word" from "backend is down".
 * Both now arrive as a typed `ApiError`.
 */
export async function fetchData<Data>(
  endpoint: string,
  attempts: number = DEFAULT_ATTEMPTS,
): Promise<Data> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fetchDataOnce<Data>(endpoint);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === attempts - 1) break;
      // Exponential backoff, so a struggling backend gets room instead of three
      // instant retries piled onto whatever it's already failing to handle.
      await delay(BASE_BACKOFF_MS * 2 ** attempt);
    }
  }

  throw lastError;
}

async function fetchDataOnce<Data>(endpoint: string): Promise<Data> {
  const response = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<Data>;
}
