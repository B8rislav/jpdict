'use client';

import { type FC } from 'react';
import { addWordFx, useSavedExpressions } from '@/features/Dictionary';
import { kanjiToPayload } from '@/features/Dictionary/lib/kanjiToPayload';
import { type Kanji } from '@/shared/api/types';
import { KanjiCardView } from './ui/KanjiCardView';
import { useProfile } from '@/shared/profile/context';

export const KanjiCard: FC<Kanji> = (props) => {
  const selectedLanguage = useProfile().selectedLanguage;
  const character = props.kanji ?? '';
  const saved = useSavedExpressions(character ? [character] : [], 'kanji');

  return (
    <KanjiCardView
      {...props}
      selectedLanguage={selectedLanguage}
      isSaved={saved.has(character)}
      onSave={character ? () => addWordFx(kanjiToPayload(props)) : undefined}
    />
  );
};
