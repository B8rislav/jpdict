import {
  type BackendReviewCard,
  type BackendReviewResult,
  type ReviewCard,
  type ReviewResult,
  type ReviewStats,
} from '@/features/Review/api/types';
import { type CardType, type DeckSummary } from '../types';
import { levelMarkers } from './levels';

/**
 * Review payload translation. Lives in `shared/api` rather than the Review
 * feature because its only callers are the BFF route handlers — server code
 * importing out of a feature slice was a backwards dependency.
 */

/** Map a backend review card to the Word-shaped card the UI renders. */
export function toReviewCard(card: BackendReviewCard): ReviewCard {
  return {
    id: card.id,
    language: card.language,
    kanji_full: card.expression,
    hiragana_full: card.reading,
    def_en: [card.meaning],
    markers: levelMarkers(card.jlpt_level, card.hsk_level),
    status: card.status,
    dueAt: card.due_at,
    intervalDays: card.interval_days,
    easeFactor: card.ease_factor,
    repetitions: card.repetitions,
    lapses: card.lapses,
    lastReviewedAt: card.last_reviewed_at,
    suspended: card.suspended,
    projectedIntervals: card.projected_intervals,
  };
}

/** One `decks[]` entry as FastAPI serialises it. */
export interface BackendDeckSummary {
  card_type: CardType;
  total: number;
  due: number;
  new_today: number;
  done_today: number;
}

/** Raw `/api/review/stats` payload: language totals plus the per-deck breakdown. */
export interface BackendReviewStats {
  new: number;
  due: number;
  learned: number;
  suspended: number;
  decks?: BackendDeckSummary[];
}

/**
 * Map the stats payload. The flat counts already match the UI shape and are passed
 * through; only `decks` needs renaming into camelCase.
 */
export function toReviewStats(stats: BackendReviewStats): ReviewStats {
  return {
    new: stats.new,
    due: stats.due,
    learned: stats.learned,
    suspended: stats.suspended,
    decks: (stats.decks ?? []).map(toDeckSummary),
  };
}

export function toDeckSummary(deck: BackendDeckSummary): DeckSummary {
  return {
    cardType: deck.card_type,
    total: deck.total,
    due: deck.due,
    newToday: deck.new_today,
    doneToday: deck.done_today,
  };
}

/** Map a backend grading result to its camelCase UI shape. */
export function toReviewResult(result: BackendReviewResult): ReviewResult {
  return {
    dueAt: result.due_at,
    intervalDays: result.interval_days,
    repetitions: result.repetitions,
    easeFactor: result.ease_factor,
  };
}
