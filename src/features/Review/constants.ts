/**
 * The canonical four-point recall scale, in ascending order.
 *
 * The backend accepts these strings directly on `POST /api/review/{id}` (its
 * `Grade` enum is `again|hard|good|easy`), so — unlike the original task note —
 * there is no numeric mapping at the API boundary. The numeric SM-2 quality
 * scores live inside the backend and the local interval projection (see lib/srs).
 */
export const GRADES = ['again', 'hard', 'good', 'easy'] as const;

export type Grade = (typeof GRADES)[number];

/** Designoslav button variant per grade, worst → best. */
export const GRADE_VARIANT: Record<Grade, 'accent' | 'ghost' | 'secondary' | 'primary'> = {
  again: 'accent',
  hard: 'ghost',
  good: 'secondary',
  easy: 'primary',
};

/** Keyboard digit (1–4) → grade, for review-session shortcuts. */
export const GRADE_BY_KEY: Record<string, Grade> = {
  '1': 'again',
  '2': 'hard',
  '3': 'good',
  '4': 'easy',
};
