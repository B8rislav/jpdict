import {
  type DeckSummary,
  type Language,
  type MasteryStatus,
  type Word,
} from '@/shared/api/types';
import { type Grade } from '../constants';

/** Seconds-until-due the card would get for each grade — computed by the backend scheduler. */
export type ProjectedIntervals = Record<Grade, number>;

/** A flashcard as the UI consumes it: Word-shaped (so existing card fragments render it) + SRS state. */
export type ReviewCard = Word & {
  id: string;
  language: Language;
  status: MasteryStatus;
  dueAt: string | null;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  suspended: boolean;
  projectedIntervals: ProjectedIntervals;
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
};

/** Raw `ReviewResult` payload from the backend (snake_case). */
export type BackendReviewResult = {
  due_at: string;
  interval_days: number;
  repetitions: number;
  ease_factor: number;
};
