'use client';

import { Button, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { type FC } from 'react';

import { $savedWords, removeWordFx, updateStatusFx } from './model';
import { useDictionaryFilters } from './model/useDictionaryFilters';
import { HSK_LEVELS, JLPT_LEVELS, MASTERY_CYCLE, nextStatus } from './constants';
import { t } from '@/shared/i18n';
import { DictionaryWordCard } from './DictionaryWordCard';
import styles from './DictionaryPanel.module.css';

export const DictionaryPanel: FC = () => {
  const savedWords = useUnit($savedWords);
  const { filtered, levelFilter, statusFilter, toggleLevel, toggleStatus, hasJlpt, hasHsk } =
    useDictionaryFilters(savedWords);

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        {(hasJlpt || hasHsk) && (
          <div className={styles.filterRow}>
            <Text className={styles.filterLabel} variant="caption-2">
              {t('ui', 'dict_filter_level')}
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
            {t('ui', 'dict_filter_status')}
          </Text>
          {MASTERY_CYCLE.map((s) => (
            <Button
              key={s}
              size="s"
              view={statusFilter === s ? 'normal' : 'outlined'}
              onClick={() => toggleStatus(s)}
            >
              {t('mastery', s)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="body-2">
            {t('ui', savedWords.length === 0 ? 'dict_empty' : 'dict_no_filter')}
          </Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((word) => (
            <li key={word.id}>
              <DictionaryWordCard
                word={word}
                onDelete={() => word.id && removeWordFx(word.id)}
                onAdvanceStatus={() =>
                  word.id && updateStatusFx({ id: word.id, status: nextStatus(word.status) })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
