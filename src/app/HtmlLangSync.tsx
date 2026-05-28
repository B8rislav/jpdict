'use client';

import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';

export function HtmlLangSync() {
  const { selectedLanguage, uiLocale } = useUnit($userProfile);

  useEffect(() => {
    if (selectedLanguage) {
      document.documentElement.setAttribute('data-lang', selectedLanguage);
    } else {
      document.documentElement.removeAttribute('data-lang');
    }
  }, [selectedLanguage]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', uiLocale);
  }, [uiLocale]);

  return null;
}
