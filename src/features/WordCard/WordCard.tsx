'use client';

import { type FC } from 'react';
import { useUnit } from 'effector-react';
import { type Word } from '@/shared/api/types';
import { $savedWords, addWordFx } from '@/features/Dictionary';
import { WordCardView } from './ui/WordCardView';
import { useT } from '@/shared/i18n';
import { useProfile } from '@/shared/profile/context';

export const WordCard: FC<Word> = (props) => {
  const t = useT();
  const { kanji_full, hiragana_full } = props;
  const selectedLanguage = useProfile().selectedLanguage;
  const savedWords = useUnit($savedWords);
  const expression = kanji_full ?? hiragana_full;
  const isSaved = Boolean(
    expression && savedWords.some((w) => (w.kanji_full ?? w.hiragana_full) === expression),
  );
  const readingLabel = t('ui', selectedLanguage === 'cn' ? 'reading_label_cn' : 'reading_label_jp');

  return (
    <WordCardView
      {...props}
      readingLabel={readingLabel}
      isSaved={isSaved}
      onSave={() => {
        if (!isSaved) addWordFx(props);
      }}
    />
  );
};
