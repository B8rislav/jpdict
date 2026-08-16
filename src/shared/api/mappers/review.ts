import {
  type BackendReviewActivity,
  type BackendReviewCard,
  type BackendReviewResult,
  type ReviewActivity,
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
    cardType: card.card_type,
    kanji_full: card.expression,
    hiragana_full: card.reading,
    def_en: [card.meaning],
    markers: levelMarkers(card.jlpt_level, card.hsk_level),
    components: (card.components ?? []).map((component) => ({
      character: component.character,
      readings: component.readings ?? [],
      meanings: component.meanings ?? [],
    })),
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
  done_today?: number;
  daily_goal?: number;
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
    doneToday: stats.done_today ?? 0,
    // Falls back to the backend's own default rather than 0: a goal of 0 would make
    // the ring divide by zero and read «0 из 0» as if the user had no target.
    dailyGoal: stats.daily_goal ?? DEFAULT_DAILY_GOAL,
  };
}

/** Mirrors the backend's `users.daily_goal` server default; used only as a fallback. */
const DEFAULT_DAILY_GOAL = 10;

/** Map the activity series. Only `days[].new` needs renaming away from the reserved word. */
export function toReviewActivity(activity: BackendReviewActivity): ReviewActivity {
  return {
    days: activity.days.map((day) => ({
      date: day.date,
      reviews: day.reviews,
      new: day.new,
      seconds: day.seconds,
    })),
    streak: activity.streak,
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
