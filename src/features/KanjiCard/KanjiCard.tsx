'use client';

import { type FC } from 'react';
import { useUnit } from 'effector-react';
import { type Kanji } from '@/shared/api/types';
import { $userProfile } from '@/stores/userProfile';
import { KanjiCardView } from './ui/KanjiCardView';

export const KanjiCard: FC<Kanji> = (props) => {
  const selectedLanguage = useUnit($userProfile).selectedLanguage;
  return <KanjiCardView {...props} selectedLanguage={selectedLanguage} />;
};
