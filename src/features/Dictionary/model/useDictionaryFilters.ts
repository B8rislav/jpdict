import { useMemo, useState } from 'react';
import { type MasteryStatus, type SavedWord } from '@/shared/api/types';

export function useDictionaryFilters(words: SavedWord[]) {
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MasteryStatus | null>(null);

  const hasJlpt = words.some((w) => w.markers?.some((m) => m.startsWith('JLPT')));
  const hasHsk = words.some((w) => w.markers?.some((m) => m.startsWith('HSK')));

  const filtered = useMemo(
    () =>
      words.filter((w) => {
        if (statusFilter && w.status !== statusFilter) return false;
        if (levelFilter && !w.markers?.some((m) => m.includes(levelFilter))) return false;
        return true;
      }),
    [words, levelFilter, statusFilter],
  );

  const toggleLevel = (level: string) => setLevelFilter((prev) => (prev === level ? null : level));
  const toggleStatus = (s: MasteryStatus) => setStatusFilter((prev) => (prev === s ? null : s));

  return { filtered, levelFilter, statusFilter, toggleLevel, toggleStatus, hasJlpt, hasHsk };
}
