'use client';

import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';

export function HtmlLangSync() {
  const selectedLanguage = useUnit($userProfile).selectedLanguage;

  useEffect(() => {
    if (selectedLanguage) {
      document.documentElement.setAttribute('data-lang', selectedLanguage);
    } else {
      document.documentElement.removeAttribute('data-lang');
    }
  }, [selectedLanguage]);

  return null;
}
