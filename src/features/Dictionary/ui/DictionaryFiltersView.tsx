'use client';

import { SearchField, ToggleGroup } from 'designoslav';
import { type FC } from 'react';

import { type CardType, type Language } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { HSK_LEVELS, JLPT_LEVELS, MASTERY_CYCLE } from '../constants';
import { ALL } from '../model/query';
import styles from './DictionaryFiltersView.module.css';

export type DictionaryFiltersViewProps = {
  deck: CardType;
  language: Language;
  level: string;
  status: string;
  q: string;
  /** Rows currently matching — the «Показано: N» figure. */
  shown: number;
  onLevelChange: (level: string) => void;
  onStatusChange: (status: string) => void;
  onQueryChange: (q: string) => void;
};

export const DictionaryFiltersView: FC<DictionaryFiltersViewProps> = ({
  deck,
  language,
  level,
  status,
  q,
  shown,
  onLevelChange,
  onStatusChange,
  onQueryChange,
}) => {
  const t = useT();
  const all = t('ui', 'dict_filter_all');

  // «Все» is a real option rather than a null state, so the control stays a plain
  // single-select radiogroup instead of needing a deselect affordance.
  const levels = language === 'cn' ? HSK_LEVELS : JLPT_LEVELS;
  const levelOptions = [
    { value: ALL, label: all },
    ...levels.map((value) => ({ value, label: value })),
  ];
  const statusOptions = [
    { value: ALL, label: all },
    ...MASTERY_CYCLE.map((value) => ({ value, label: t('mastery', value) })),
  ];

  return (
    <div className={styles.filters}>
      <SearchField
        className={styles.search}
        aria-label={t('ui', deck === 'kanji' ? 'dict_search_kanji' : 'dict_search_words')}
        placeholder={t('ui', deck === 'kanji' ? 'dict_search_kanji' : 'dict_search_words')}
        value={q}
        onValueChange={onQueryChange}
        clearLabel={t('ui', 'search_clear')}
      />

      <ToggleGroup
        aria-label={t('ui', 'dict_filter_level')}
        options={levelOptions}
        value={level}
        onChange={onLevelChange}
      />

      <ToggleGroup
        aria-label={t('ui', 'dict_filter_status')}
        options={statusOptions}
        value={status}
        onChange={onStatusChange}
      />

      <span className={styles.shown}>
        {t('ui', 'dict_shown')}: {shown}
      </span>
    </div>
  );
};
