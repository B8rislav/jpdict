'use client';

import { Button, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { FC, useMemo, useState } from 'react';

import { MasteryStatus } from '@/shared/api/types';
import { $savedWords } from './model';
import { HSK_LEVELS, JLPT_LEVELS, MASTERY_CYCLE, MASTERY_LABEL } from './constants';
import { DictionaryWordCard } from './DictionaryWordCard';
import styles from './DictionaryPanel.module.css';

export const DictionaryPanel: FC = () => {
  const savedWords = useUnit($savedWords);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MasteryStatus | null>(null);

  const hasJlpt = savedWords.some((w) => w.markers?.some((m) => m.startsWith('JLPT')));
  const hasHsk = savedWords.some((w) => w.markers?.some((m) => m.startsWith('HSK')));

  const filtered = useMemo(
    () =>
      savedWords.filter((w) => {
        if (statusFilter && w.status !== statusFilter) return false;
        if (levelFilter && !w.markers?.some((m) => m.includes(levelFilter))) return false;
        return true;
      }),
    [savedWords, levelFilter, statusFilter],
  );

  const toggleLevel = (level: string) =>
    setLevelFilter((prev) => (prev === level ? null : level));
  const toggleStatus = (s: MasteryStatus) =>
    setStatusFilter((prev) => (prev === s ? null : s));

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        {(hasJlpt || hasHsk) && (
          <div className={styles.filterRow}>
            <Text className={styles.filterLabel} variant="caption-2">
              Уровень
            </Text>
            {hasJlpt &&
              JLPT_LEVELS.map((lvl) => (
                <Button
                  key={lvl}
                  size="s"
                  view={levelFilter === lvl ? 'normal' : 'outlined'}
                  onClick={() => toggleLevel(lvl)}
                >
                  {lvl}
                </Button>
              ))}
            {hasHsk &&
              HSK_LEVELS.map((lvl) => (
                <Button
                  key={lvl}
                  size="s"
                  view={levelFilter === lvl ? 'normal' : 'outlined'}
                  onClick={() => toggleLevel(lvl)}
                >
                  {lvl}
                </Button>
              ))}
          </div>
        )}

        <div className={styles.filterRow}>
          <Text className={styles.filterLabel} variant="caption-2">
            Статус
          </Text>
          {MASTERY_CYCLE.map((s) => (
            <Button
              key={s}
              size="s"
              view={statusFilter === s ? 'normal' : 'outlined'}
              onClick={() => toggleStatus(s)}
            >
              {MASTERY_LABEL[s]}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="body-2">
            {savedWords.length === 0 ? 'Словарь пуст' : 'Нет слов по фильтру'}
          </Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((word) => (
            <li key={word.id}>
              <DictionaryWordCard word={word} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
