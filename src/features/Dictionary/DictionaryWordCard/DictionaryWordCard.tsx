'use client';

import { Button, Label, Text } from '@gravity-ui/uikit';
import { MarkerList } from '@/shared/ui/MarkerList/MarkerList';
import { FC } from 'react';

import { SavedWord } from '@/shared/api/types';
import { MASTERY_LABEL, MASTERY_THEME } from '../constants';
import styles from './DictionaryWordCard.module.css';

type Props = {
  word: SavedWord;
  onDelete: () => void;
  onAdvanceStatus: () => void;
};

export const DictionaryWordCard: FC<Props> = ({ word, onDelete, onAdvanceStatus }) => {
  const handleStatusClick = () => onAdvanceStatus();
  const handleDelete = () => onDelete();

  return (
    <div className={styles.card}>
      <div className={styles.wordInfo}>
        <Text variant="subheader-2">{word.kanji_full ?? word.hiragana_full}</Text>
        {word.kanji_full && (
          <Text className={styles.reading} variant="body-2">
            {word.hiragana_full}
          </Text>
        )}
        <Text className={styles.definition} variant="body-2">
          {(word.def_ru?.length ? word.def_ru : word.def_en)?.[0]}
        </Text>
      </div>
      <div className={styles.actions}>
        <MarkerList markers={word.markers} />
        <span onClick={handleStatusClick} style={{ cursor: 'pointer' }}>
          <Label theme={MASTERY_THEME[word.status]}>{MASTERY_LABEL[word.status]}</Label>
        </span>
        <Button size="s" view="outlined-danger" onClick={handleDelete}>
          ✕
        </Button>
      </div>
    </div>
  );
};
