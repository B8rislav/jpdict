'use client';

import { type FC } from 'react';
import { type Kanji } from '@/shared/api/types';
import { KanjiCardView } from './ui/KanjiCardView';
import { useProfile } from '@/shared/profile/context';

export const KanjiCard: FC<Kanji> = (props) => {
  const selectedLanguage = useProfile().selectedLanguage;
  return <KanjiCardView {...props} selectedLanguage={selectedLanguage} />;
};
