import { MasteryStatus } from '@/shared/api/types';

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export const HSK_LEVELS = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'] as const;

export const MASTERY_CYCLE: MasteryStatus[] = ['new', 'learning', 'known'];

export const MASTERY_THEME: Record<MasteryStatus, 'normal' | 'warning' | 'success'> = {
  new: 'normal',
  learning: 'warning',
  known: 'success',
};

export const MASTERY_LABEL: Record<MasteryStatus, string> = {
  new: 'Новое',
  learning: 'Учу',
  known: 'Знаю',
};

export function nextStatus(current: MasteryStatus): MasteryStatus {
  const idx = MASTERY_CYCLE.indexOf(current);
  return MASTERY_CYCLE[(idx + 1) % MASTERY_CYCLE.length];
}
