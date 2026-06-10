import { type Language } from '@/shared/api/types';
import { type Grade } from '../constants';
import { type ReviewCard, type ReviewResult, type ReviewStats } from './types';

/**
 * Typed clients for the review BFF (`src/app/api/review/*`), which forwards to
 * the FastAPI SRS endpoints. Responses are already mapped to the UI shape by
 * the BFF, so these just parse and surface errors.
 */

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Review request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/** Fetch the next cards to study for a language (due first, then new). */
export async function fetchQueue(language: Language, limit?: number): Promise<ReviewCard[]> {
  const params = new URLSearchParams({ language });
  if (limit != null) params.set('limit', String(limit));
  return asJson<ReviewCard[]>(await fetch(`/api/review/queue?${params.toString()}`));
}

/** Fetch the dashboard counts for a language. */
export async function fetchStats(language: Language): Promise<ReviewStats> {
  const params = new URLSearchParams({ language });
  return asJson<ReviewStats>(await fetch(`/api/review/stats?${params.toString()}`));
}

/** Grade a card and get its next scheduling. */
export async function gradeCard(id: string, grade: Grade): Promise<ReviewResult> {
  return asJson<ReviewResult>(
    await fetch(`/api/review/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade }),
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
