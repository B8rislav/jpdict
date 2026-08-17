import { describe, it, expect, vi } from 'vitest';
import { fork, allSettled } from 'effector';

// Stub the network layer so effects resolve without real fetches.
vi.mock('../api', () => ({
  fetchQueue: vi.fn(async () => []),
  fetchStats: vi.fn(async () => null),
  fetchActivity: vi.fn(async () => null),
  gradeCard: vi.fn(async () => ({ dueAt: '', intervalDays: 1, repetitions: 1, easeFactor: 2.5 })),
  suspendCard: vi.fn(async () => ({})),
  unsuspendCard: vi.fn(async () => ({})),
}));

import { type ReviewCard } from '../api/types';
import { $queue, $current, $stats, nextCard, gradeCurrent, suspendFx } from './index';

function card(id: string, overrides: Partial<ReviewCard> = {}): ReviewCard {
  return {
    id,
    language: 'jp',
    cardType: 'word',
    components: [],
    kanji_full: '食べる',
    hiragana_full: 'たべる',
    def_en: ['to eat'],
    markers: [],
    status: 'new',
    dueAt: null,
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    lapses: 0,
    lastReviewedAt: null,
    suspended: false,
    projectedIntervals: { again: 60, hard: 60, good: 600, easy: 345600 },
    ...overrides,
  };
}

describe('review store', () => {
  it('$current is the head of the queue', () => {
    const scope = fork({ values: [[$queue, [card('a'), card('b')]]] });
    expect(scope.getState($current)?.id).toBe('a');
  });

  it('nextCard advances past the current card', async () => {
    const scope = fork({ values: [[$queue, [card('a'), card('b')]]] });
    await allSettled(nextCard, { scope });
    expect(scope.getState($queue).map((c) => c.id)).toEqual(['b']);
    expect(scope.getState($current)?.id).toBe('b');
  });

  it('grading advances the queue', async () => {
    const scope = fork({ values: [[$queue, [card('a'), card('b')]]] });
    await allSettled(gradeCurrent, { scope, params: { grade: 'good' } });
    expect(scope.getState($queue).map((c) => c.id)).toEqual(['b']);
  });

  it('grading a due card moves it from due to learned', async () => {
    const scope = fork({
      values: [
        [$queue, [card('a', { lastReviewedAt: '2026-06-01T00:00:00Z', status: 'learning' })]],
        [$stats, { new: 2, due: 3, learned: 5, suspended: 0, decks: [], doneToday: 4, dailyGoal: 10 }],
      ],
    });
    await allSettled(gradeCurrent, { scope, params: { grade: 'good' } });
    expect(scope.getState($stats)).toEqual({
      new: 2,
      due: 2,
      learned: 6,
      suspended: 0,
      decks: [],
      doneToday: 5,
      dailyGoal: 10,
    });
  });

  it('grading a new card moves it from new to learned', async () => {
    const scope = fork({
      values: [
        [$queue, [card('a', { lastReviewedAt: null })]],
        [$stats, { new: 2, due: 3, learned: 5, suspended: 0, decks: [], doneToday: 4, dailyGoal: 10 }],
      ],
    });
    await allSettled(gradeCurrent, { scope, params: { grade: 'good' } });
    expect(scope.getState($stats)).toEqual({
      new: 1,
      due: 3,
      learned: 6,
      suspended: 0,
      decks: [],
      doneToday: 5,
      dailyGoal: 10,
    });
  });

  it("«again» requeues the card to the back of today's stack", async () => {
    const scope = fork({ values: [[$queue, [card('a'), card('b'), card('c')]]] });
    await allSettled(gradeCurrent, { scope, params: { grade: 'again' } });
    // Not dropped and not left in front — it comes round again this session.
    expect(scope.getState($queue).map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('«again» leaves the counts alone — the card is not finished', async () => {
    const stats = { new: 2, due: 3, learned: 5, suspended: 0, decks: [], doneToday: 4, dailyGoal: 10 };
    const scope = fork({
      values: [[$queue, [card('a', { lastReviewedAt: null })]], [$stats, stats]],
    });
    await allSettled(gradeCurrent, { scope, params: { grade: 'again' } });
    // Counting it would let «сделано» outrun the day's workload, which is the bug
    // that made the deck card read «12 из 6».
    expect(scope.getState($stats)).toEqual(stats);
  });

  it('suspending drops the card from the queue', async () => {
    const scope = fork({ values: [[$queue, [card('a'), card('b')]]] });
    await allSettled(suspendFx, { scope, params: 'a' });
    expect(scope.getState($queue).map((c) => c.id)).toEqual(['b']);
  });
});
