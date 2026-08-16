import {
  type CardType,
  type DeckSummary,
  type Language,
  type MasteryStatus,
  type Word,
} from '@/shared/api/types';
import { type Grade } from '../constants';

/** A constituent part of a kanji card, as the answer face's chip renders it. */
export type CardComponent = {
  character: string;
  /** Kun'yomi first — a part's native reading identifies it better than its on'yomi. */
  readings: string[];
  meanings: string[];
};

/** Seconds-until-due the card would get for each grade — computed by the backend scheduler. */
export type ProjectedIntervals = Record<Grade, number>;

/** A flashcard as the UI consumes it: Word-shaped (so existing card fragments render it) + SRS state. */
export type ReviewCard = Word & {
  id: string;
  language: Language;
  /** Which deck the card came from — the session badges each card with its own. */
  cardType: CardType;
  status: MasteryStatus;
  dueAt: string | null;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  suspended: boolean;
  projectedIntervals: ProjectedIntervals;
  /** Filled for kanji cards only; empty when the character isn't cached backend-side. */
  components: CardComponent[];
};

/**
 * Dashboard counts for one study language. Mirrors the backend's non-overlapping
 * partition; `decks` breaks the same numbers down per card type for /dictionary.
 */
export type ReviewStats = {
  new: number;
  due: number;
  learned: number;
  suspended: number;
  decks: DeckSummary[];
  /** Reviews logged today in the caller's timezone — the goal ring's numerator. */
  doneToday: number;
  /** The user's review target for the day (`users.daily_goal`). */
  dailyGoal: number;
};

/** One day of the activity heatmap. */
export type DayActivity = {
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  /** Every review that day, new cards included. */
  reviews: number;
  /** The subset that were first-ever reviews; repeats are `reviews - new`. */
  new: number;
  /** Summed time on card. `null` — not 0 — when nothing that day was timed. */
  seconds: number | null;
};

/** The heatmap series plus the streak headline. */
export type ReviewActivity = {
  /** Contiguous and Monday-first, running through today and never past it. */
  days: DayActivity[];
  /** Consecutive active days, counted over all history rather than this window. */
  streak: number;
};

/** The next scheduling returned after grading a card. */
export type ReviewResult = {
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
};

/** Raw `ReviewCard` payload from the FastAPI backend (snake_case). */
export type BackendReviewCard = {
  id: string;
  language: Language;
  card_type: CardType;
  expression: string;
  reading: string;
  meaning: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  status: MasteryStatus;
  due_at: string | null;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  lapses: number;
  last_reviewed_at: string | null;
  suspended: boolean;
  projected_intervals: ProjectedIntervals;
  components?: { character: string; readings?: string[]; meanings?: string[] }[];
};

/** Raw `/api/review/activity` payload from the backend (snake_case). */
export type BackendReviewActivity = {
  days: { date: string; reviews: number; new: number; seconds: number | null }[];
  streak: number;
};

/** Raw `ReviewResult` payload from the backend (snake_case). */
export type BackendReviewResult = {
  due_at: string;
  interval_days: number;
  repetitions: number;
  ease_factor: number;
};
