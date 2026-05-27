'use client';

import { FC } from 'react';
import { useUnit } from 'effector-react';
import { Kanji } from '@/shared/api/types';
import { $userProfile } from '@/stores/userProfile';
import { KanjiCardView } from './ui/KanjiCardView';

export const KanjiCard: FC<Kanji> = (props) => {
  const selectedLanguage = useUnit($userProfile).selectedLanguage;
  return <KanjiCardView {...props} selectedLanguage={selectedLanguage} />;
};
