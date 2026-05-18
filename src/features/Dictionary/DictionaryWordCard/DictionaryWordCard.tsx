'use client';

import { Button, Label, Text } from '@gravity-ui/uikit';
import { FC } from 'react';

import { SavedWord } from '@/shared/api/types';
import { removeWordFx, updateStatusFx } from '../model';
import { MASTERY_LABEL, MASTERY_THEME, nextStatus } from '../constants';
import styles from './DictionaryWordCard.module.css';

type Props = { word: SavedWord };

export const DictionaryWordCard: FC<Props> = ({ word }) => {
  const handleStatusClick = () => {
    if (!word.id) return;
    updateStatusFx({ id: word.id, status: nextStatus(word.status) });
  };

  const handleDelete = () => {
    if (!word.id) return;
    removeWordFx(word.id);
  };

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
          {word.def?.[0]}
        </Text>
      </div>
      <div className={styles.actions}>
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
