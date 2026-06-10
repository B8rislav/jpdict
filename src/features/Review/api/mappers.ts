import {
  type BackendReviewCard,
  type BackendReviewResult,
  type ReviewCard,
  type ReviewResult,
} from './types';

/** Map a backend review card to the Word-shaped card the UI renders. */
export function toReviewCard(c: BackendReviewCard): ReviewCard {
  const markers: string[] = [];
  if (c.jlpt_level) markers.push(`JLPT N${c.jlpt_level}`);
  if (c.hsk_level) markers.push(`HSK ${c.hsk_level}`);
  return {
    id: c.id,
    language: c.language,
    kanji_full: c.expression,
    hiragana_full: c.reading,
    def_en: [c.meaning],
    markers,
    status: c.status,
    dueAt: c.due_at,
    intervalDays: c.interval_days,
    easeFactor: c.ease_factor,
    repetitions: c.repetitions,
    lapses: c.lapses,
    lastReviewedAt: c.last_reviewed_at,
    suspended: c.suspended,
    projectedIntervals: c.projected_intervals,
  };
}

/** Map a backend grading result to its camelCase UI shape. */
export function toReviewResult(r: BackendReviewResult): ReviewResult {
  return {
    dueAt: r.due_at,
    intervalDays: r.interval_days,
    repetitions: r.repetitions,
    easeFactor: r.ease_factor,
  };
}
