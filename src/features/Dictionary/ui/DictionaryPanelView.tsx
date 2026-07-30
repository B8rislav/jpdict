'use client';

import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { type FC } from 'react';

import { type MasteryStatus, type SavedWord } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { HSK_LEVELS, JLPT_LEVELS, MASTERY_CYCLE } from '../constants';
import { DictionaryWordCard } from '../DictionaryWordCard';
import styles from './DictionaryPanelView.module.css';

export type DictionaryPanelViewProps = {
  /** Words passing the active filters — what actually renders. */
  words: SavedWord[];
  /** Total saved, so the empty state can say "nothing saved" vs "nothing matches". */
  totalCount: number;
  levelFilter: string | null;
  statusFilter: MasteryStatus | null;
  /** Whether the collection contains any JLPT / HSK levels worth offering as filters. */
  hasJlpt: boolean;
  hasHsk: boolean;
  onToggleLevel: (level: string) => void;
  onToggleStatus: (status: MasteryStatus) => void;
  onDelete: (word: SavedWord) => void;
  onAdvanceStatus: (word: SavedWord) => void;
  onToggleSuspend: (word: SavedWord) => void;
};

export const DictionaryPanelView: FC<DictionaryPanelViewProps> = ({
  words,
  totalCount,
  levelFilter,
  statusFilter,
  hasJlpt,
  hasHsk,
  onToggleLevel,
  onToggleStatus,
  onDelete,
  onAdvanceStatus,
  onToggleSuspend,
}) => {
  const t = useT();

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        {(hasJlpt || hasHsk) && (
          <div className={styles.filterRow}>
            <Text className={styles.filterLabel} variant="caption-2">
              {t('ui', 'dict_filter_level')}
            </Text>
            {[...(hasJlpt ? JLPT_LEVELS : []), ...(hasHsk ? HSK_LEVELS : [])].map((level) => (
              <Button
                key={level}
                size="m"
                variant={levelFilter === level ? 'primary' : 'secondary'}
                onClick={() => onToggleLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        )}

        <div className={styles.filterRow}>
          <Text className={styles.filterLabel} variant="caption-2">
            {t('ui', 'dict_filter_status')}
          </Text>
          {MASTERY_CYCLE.map((status) => (
            <Button
              key={status}
              size="m"
              variant={statusFilter === status ? 'primary' : 'secondary'}
              onClick={() => onToggleStatus(status)}
            >
              {t('mastery', status)}
            </Button>
          ))}
        </div>
      </div>

      {words.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="body-2">
            {t('ui', totalCount === 0 ? 'dict_empty' : 'dict_no_filter')}
          </Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {words.map((word) => (
            <li key={word.id}>
              <DictionaryWordCard
                word={word}
                onDelete={() => onDelete(word)}
                onAdvanceStatus={() => onAdvanceStatus(word)}
                onToggleSuspend={() => onToggleSuspend(word)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
