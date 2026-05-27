'use client';

import { type FC } from 'react';
import { useUnit } from 'effector-react';
import { type Word } from '@/shared/api/types';
import { $userProfile } from '@/stores/userProfile';
import { $savedWords, addWordFx } from '@/features/Dictionary';
import { WordCardView } from './ui/WordCardView';

export const WordCard: FC<Word> = (props) => {
  const { kanji_full, hiragana_full } = props;
  const selectedLanguage = useUnit($userProfile).selectedLanguage;
  const savedWords = useUnit($savedWords);
  const expression = kanji_full ?? hiragana_full;
  const isSaved = Boolean(
    expression && savedWords.some((w) => (w.kanji_full ?? w.hiragana_full) === expression),
  );
  const readingLabel = selectedLanguage === 'cn' ? 'Pinyin' : 'Hiragana';

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
