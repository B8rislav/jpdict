import { type BadgeTone } from 'designoslav';
import { type MasteryStatus } from '@/shared/api/types';

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export const HSK_LEVELS = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'] as const;

export const MASTERY_CYCLE: MasteryStatus[] = ['new', 'learning', 'known'];

/**
 * Mastery mapped onto the design system's colour roles: unseen is neutral, in-progress
 * borrows the warm accent, mastered the celadon. One map drives the row's accent bar,
 * the status pill and the kanji tile's dot, so those cannot drift apart.
 */
export const MASTERY_TONE: Record<MasteryStatus, BadgeTone> = {
  new: 'neutral',
  learning: 'accent',
  known: 'primary',
};

export function nextStatus(current: MasteryStatus): MasteryStatus {
  const idx = MASTERY_CYCLE.indexOf(current);
  return MASTERY_CYCLE[(idx + 1) % MASTERY_CYCLE.length];
}
