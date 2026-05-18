'use client';

import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { $userProfile, loadUserProfile, setSelectedLanguage, type Language } from '../../stores/userProfile';
import LanguageCard from './LanguageCard';
import styles from './LanguageSelect.module.css';
import ruTranslations from '@/shared/i18n/ru.json';

const getTranslation = (category: keyof typeof ruTranslations, key: string) => {
  return (ruTranslations[category] as Record<string, string>)?.[key] || key;
};

const LanguageSelect = () => {
  const selectedLanguage = useUnit($userProfile).selectedLanguage;

  useEffect(() => {
    if (selectedLanguage === null) {
      loadUserProfile();
    }
  }, [selectedLanguage]);

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  // Если язык уже выбран, не показываем экран
  if (selectedLanguage) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.title}>{getTranslation('ui', 'language_select_title')}</h1>
        <div className={styles.cards}>
          <LanguageCard
            language="jp"
            title="Японский"
            description={getTranslation('ui', 'language_select_jp_description')}
            onSelect={handleSelectLanguage}
          />
          <LanguageCard
            language="cn"
            title="Китайский"
            description={getTranslation('ui', 'language_select_cn_description')}
            onSelect={handleSelectLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;