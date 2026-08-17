import { createEffect, createEvent, createStore, sample } from 'effector';

import { fetchActivity, fetchQueue, fetchStats, gradeCard, suspendCard, unsuspendCard } from '../api';
import {
  type ReviewActivity,
  type ReviewCard,
  type ReviewResult,
  type ReviewStats,
} from '../api/types';
import { type Grade } from '../constants';
import { type CardType } from '@/shared/api/types';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';

export const $queue = createStore<ReviewCard[]>([]);
/** The card at the head of the queue, or null when the session is drained. */
export const $current = $queue.map((q) => q[0] ?? null);
export const $stats = createStore<ReviewStats | null>(null);
export const $activity = createStore<ReviewActivity | null>(null);
/** How many cards the session started with — the denominator of its progress bar. */
export const $sessionTotal = createStore(0);
/**
 * The deck the running session was scoped to, so a resync can preserve it.
 * `skipVoid: false` because `undefined` is a meaningful value here — it means "both
 * decks", not "no update".
 */
const $sessionDeck = createStore<CardType | undefined>(undefined, { skipVoid: false });

/** Manually advance past the current card (e.g. a "skip" affordance). */
export const nextCard = createEvent();
/**
 * Grade the current card by recall level, carrying the time it was on screen. The
 * store pairs it with the head card; `elapsedMs` is the client's only contribution
 * to the day panel's «Время», and the backend clamps it.
 */
export const gradeCurrent = createEvent<{ grade: Grade; elapsedMs?: number }>();

export const fetchQueueFx = createEffect(async (deck?: CardType): Promise<ReviewCard[]> => {
  const language = $userProfile.getState().selectedLanguage;
  if (!language || !$isAuthenticated.getState()) return [];
  return fetchQueue(language, { deck });
});

export const fetchStatsFx = createEffect(async (): Promise<ReviewStats | null> => {
  const language = $userProfile.getState().selectedLanguage;
  if (!language || !$isAuthenticated.getState()) return null;
  return fetchStats(language);
});

export const fetchActivityFx = createEffect(async (): Promise<ReviewActivity | null> => {
  const language = $userProfile.getState().selectedLanguage;
  if (!language || !$isAuthenticated.getState()) return null;
  return fetchActivity(language);
});

export const gradeFx = createEffect(
  ({ id, grade, elapsedMs }: { id: string; grade: Grade; elapsedMs?: number }): Promise<ReviewResult> =>
    gradeCard(id, grade, elapsedMs),
);

/**
 * Whether the running session's queue has come back yet.
 *
 * Deliberately *not* `fetchQueueFx.pending`: that is still false on the first paint,
 * before the container's effect has fired, so an empty queue would render as "deck
 * finished" for a frame — which is what made entering a session flash «всё пройдено»
 * every time. This starts false and only becomes true once a fetch settles, so the
 * unasked state and the empty state are distinguishable.
 */
export const $queueLoaded = createStore(false)
  .on(fetchQueueFx, () => false)
  // `finally`, not `doneData`: a failed fetch must not leave the session stuck
  // behind a skeleton forever.
  .on(fetchQueueFx.finally, () => true);

export const suspendFx = createEffect((id: string) => suspendCard(id));
export const unsuspendFx = createEffect((id: string) => unsuspendCard(id));

// Pair a grade request with whatever card is currently at the head of the queue.
const gradeRequested = sample({
  clock: gradeCurrent,
  source: $current,
  filter: (current): current is ReviewCard => current !== null,
  fn: (current, { grade, elapsedMs }) => ({ card: current, grade, elapsedMs }),
});

// Send the grade to the backend...
sample({
  clock: gradeRequested,
  fn: ({ card, grade, elapsedMs }) => ({ id: card.id, grade, elapsedMs }),
  target: gradeFx,
});

// The session's denominator is fixed when the queue arrives — it must not shrink as
// cards are graded, or the progress bar would sit at 100% for the whole session.
$sessionTotal.on(fetchQueueFx.doneData, (_, cards) => cards.length);
$sessionDeck.on(fetchQueueFx, (_, deck) => deck);

$queue
  .on(fetchQueueFx.doneData, (_, cards) => cards)
  // A new session starts empty rather than showing the previous one's leftovers
  // for a frame while the fetch is in flight.
  .on(fetchQueueFx, () => [])
  // Optimistically advance without awaiting the network. `again` doesn't drop the
  // card — it moves it to the back of today's stack, so it comes round again this
  // session instead of being scheduled a minute out.
  .on(gradeRequested, (q, { grade }) =>
    grade === 'again' ? [...q.slice(1), ...q.slice(0, 1)] : q.slice(1),
  )
  .on(nextCard, (q) => q.slice(1))
  // A suspended card is no longer studyable — pull it from the queue.
  .on(suspendFx.done, (q, { params: id }) => q.filter((c) => c.id !== id));

$stats
  .on(fetchStatsFx.doneData, (_, stats) => stats)
  // Optimistic reconcile: the graded card leaves new/due and is now scheduled ("learned"),
  // and the goal ring ticks up — grading is a review whether or not the card was new.
  .on(gradeRequested, (stats, { card, grade }) => {
    if (!stats) return stats;
    // `again` leaves the card due today, so nothing moves: it is not finished, it
    // hasn't been learned, and it must not tick the goal ring. Counting it here is
    // what would let «сделано» outrun the day's workload again.
    if (grade === 'again') return stats;
    const wasNew = card.lastReviewedAt === null;
    return {
      ...stats,
      new: wasNew ? Math.max(0, stats.new - 1) : stats.new,
      due: wasNew ? stats.due : Math.max(0, stats.due - 1),
      learned: stats.learned + 1,
      doneToday: stats.doneToday + 1,
    };
  });

$activity.on(fetchActivityFx.doneData, (_, activity) => activity);

// If a grade failed, the optimistic advance was wrong — resync from the server.
// The queue is refetched *with the session's deck*: resyncing unscoped would quietly
// turn a kanji-only session into a mixed one on the first network hiccup.
sample({ clock: gradeFx.fail, source: $sessionDeck, target: fetchQueueFx });
sample({ clock: gradeFx.fail, target: fetchStatsFx });
// Suspending/unsuspending shifts the counts; refetch authoritative stats.
sample({ clock: [suspendFx.done, unsuspendFx.done], target: fetchStatsFx });

// Note: the activity series is deliberately *not* refetched per grade. The heatmap
// only exists on the dashboard, which isn't on screen mid-session — the container
// reloads it when the dashboard is shown, so a 20-card session costs one request,
// not twenty.
