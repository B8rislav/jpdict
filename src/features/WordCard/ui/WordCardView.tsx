'use client';

import { Button, Text } from '@gravity-ui/uikit';
import { type FC } from 'react';
import { type Word } from '@/shared/api/types';
import { Card } from '@/shared/ui/Card';
import { MarkerList } from '@/shared/ui/MarkerList/MarkerList';
import { DefinitionList } from '@/shared/ui/DefinitionList/DefinitionList';
import styles from './WordCardView.module.css';

type WordCardViewProps = Word & {
  readingLabel: string;
  isSaved: boolean;
  onSave: () => void;
};

export const WordCardView: FC<WordCardViewProps> = ({
  kanji_full,
  hiragana_full,
  def_en,
  def_ru,
  markers,
  readingLabel,
  isSaved,
  onSave,
}) => {
  const def = def_ru?.length ? def_ru : def_en;
  return (
    <Card className={styles.card}>
      <div className={styles.main_info}>
        <div className={styles.title}>
          <Text variant={kanji_full ? 'subheader-3' : 'header-2'}>
            {readingLabel}: {hiragana_full}
          </Text>
          {kanji_full && <Text variant="header-2">{kanji_full}</Text>}
        </div>
        <MarkerList markers={markers} />
        <Button
          size="s"
          view={isSaved ? 'outlined-success' : 'outlined'}
          onClick={onSave}
          disabled={isSaved}
        >
          {isSaved ? 'Сохранено' : 'Сохранить'}
        </Button>
      </div>
      <DefinitionList items={def} />
    </Card>
  );
};
