'use client';

import { type Language } from '@/shared/api/types';
import { useProfile } from '@/shared/profile/context';
import { setSelectedLanguage } from '../../stores/userProfile';
import { LanguageSelectView } from './ui/LanguageSelectView';

const LanguageSelect = () => {
  const { selectedLanguage } = useProfile();

  // The profile arrives already resolved from Providers, so an unset language
  // now means "genuinely never chosen" rather than "not loaded yet".
  if (selectedLanguage) return null;

  return <LanguageSelectView onSelect={(language: Language) => setSelectedLanguage(language)} />;
};

export default LanguageSelect;
