import { createEffect, createEvent, createStore, sample } from 'effector';

import { fetchQueue, fetchStats, gradeCard, suspendCard, unsuspendCard } from '../api';
import { type ReviewCard, type ReviewResult, type ReviewStats } from '../api/types';
import { type Grade } from '../constants';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';

export const $queue = createStore<ReviewCard[]>([]);
/** The card at the head of the queue, or null when the session is drained. */
export const $current = $queue.map((q) => q[0] ?? null);
export const $stats = createStore<ReviewStats | null>(null);

/** Manually advance past the current card (e.g. a "skip" affordance). */
export const nextCard = createEvent();
/** Grade the current card by recall level; the store pairs it with the head card. */
export const gradeCurrent = createEvent<Grade>();

export const fetchQueueFx = createEffect(async (): Promise<ReviewCard[]> => {
  const language = $userProfile.getState().selectedLanguage;
  if (!language || !$isAuthenticated.getState()) return [];
  return fetchQueue(language);
});

export const fetchStatsFx = createEffect(async (): Promise<ReviewStats | null> => {
  const language = $userProfile.getState().selectedLanguage;
  if (!language || !$isAuthenticated.getState()) return null;
  return fetchStats(language);
});

export const gradeFx = createEffect(
  ({ id, grade }: { id: string; grade: Grade }): Promise<ReviewResult> => gradeCard(id, grade),
);

export const suspendFx = createEffect((id: string) => suspendCard(id));
export const unsuspendFx = createEffect((id: string) => unsuspendCard(id));

// Pair a grade request with whatever card is currently at the head of the queue.
const gradeRequested = sample({
  clock: gradeCurrent,
  source: $current,
  filter: (current): current is ReviewCard => current !== null,
  fn: (current, grade) => ({ card: current, grade }),
});

// Send the grade to the backend...
sample({
  clock: gradeRequested,
  fn: ({ card, grade }) => ({ id: card.id, grade }),
  target: gradeFx,
});

$queue
  .on(fetchQueueFx.doneData, (_, cards) => cards)
  // Optimistically advance: drop the graded/skipped card without awaiting the network.
  .on(gradeRequested, (q) => q.slice(1))
  .on(nextCard, (q) => q.slice(1))
  // A suspended card is no longer studyable — pull it from the queue.
  .on(suspendFx.done, (q, { params: id }) => q.filter((c) => c.id !== id));

$stats
  .on(fetchStatsFx.doneData, (_, stats) => stats)
  // Optimistic reconcile: the graded card leaves new/due and is now scheduled ("learned").
  .on(gradeRequested, (stats, { card }) => {
    if (!stats) return stats;
    const wasNew = card.lastReviewedAt === null;
    return {
      ...stats,
      new: wasNew ? Math.max(0, stats.new - 1) : stats.new,
      due: wasNew ? stats.due : Math.max(0, stats.due - 1),
      learned: stats.learned + 1,
    };
  });

// If a grade failed, the optimistic advance was wrong — resync from the server.
sample({ clock: gradeFx.fail, target: [fetchQueueFx, fetchStatsFx] });
// Suspending/unsuspending shifts the counts; refetch authoritative stats.
sample({ clock: [suspendFx.done, unsuspendFx.done], target: fetchStatsFx });
