import { type CardType, type Language } from '@/shared/api/types';
import { type Grade } from '../constants';
import { type ReviewActivity, type ReviewCard, type ReviewResult, type ReviewStats } from './types';

/**
 * Typed clients for the review BFF (`src/app/api/review/*`), which forwards to
 * the FastAPI SRS endpoints. Responses are already mapped to the UI shape by
 * the BFF, so these just parse and surface errors.
 */

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Review request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * The browser's IANA timezone, which decides what "today" means for the goal ring,
 * the streak, the heatmap and the daily new-card cap. Sent on every daily-scoped
 * call; the backend falls back to UTC if it can't resolve the name.
 */
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Fetch the next cards to study (due first, then new); `deck` scopes to one deck. */
export async function fetchQueue(
  language: Language,
  options: { limit?: number; deck?: CardType } = {},
): Promise<ReviewCard[]> {
  const params = new URLSearchParams({ language, tz: browserTimeZone() });
  if (options.limit != null) params.set('limit', String(options.limit));
  if (options.deck) params.set('card_type', options.deck);
  return asJson<ReviewCard[]>(await fetch(`/api/review/queue?${params.toString()}`));
}

/** Fetch the dashboard counts for a language. */
export async function fetchStats(language: Language): Promise<ReviewStats> {
  const params = new URLSearchParams({ language, tz: browserTimeZone() });
  return asJson<ReviewStats>(await fetch(`/api/review/stats?${params.toString()}`));
}

/** Fetch the heatmap series and streak for a language. */
export async function fetchActivity(language: Language, weeks?: number): Promise<ReviewActivity> {
  const params = new URLSearchParams({ language, tz: browserTimeZone() });
  if (weeks != null) params.set('weeks', String(weeks));
  return asJson<ReviewActivity>(await fetch(`/api/review/activity?${params.toString()}`));
}

/** Grade a card and get its next scheduling. `elapsedMs` is the time on card. */
export async function gradeCard(
  id: string,
  grade: Grade,
  elapsedMs?: number,
): Promise<ReviewResult> {
  return asJson<ReviewResult>(
    await fetch(`/api/review/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, ...(elapsedMs != null ? { elapsedMs } : {}) }),
    }),
  );
}

/** Suspend a card so it drops out of the queue. */
export async function suspendCard(id: string): Promise<ReviewCard> {
  return asJson<ReviewCard>(await fetch(`/api/review/${id}/suspend`, { method: 'POST' }));
}

/** Return a suspended card to rotation. */
export async function unsuspendCard(id: string): Promise<ReviewCard> {
  return asJson<ReviewCard>(await fetch(`/api/review/${id}/unsuspend`, { method: 'POST' }));
}
