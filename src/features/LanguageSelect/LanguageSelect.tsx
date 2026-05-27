'use client';

import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { type Language } from '@/shared/api/types';
import { $userProfile, loadUserProfile, setSelectedLanguage } from '../../stores/userProfile';
import LanguageCard from './ui/LanguageCard';
import styles from './LanguageSelect.module.css';
import { t } from '@/shared/i18n';

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
        <h1 className={styles.title}>{t('ui', 'language_select_title')}</h1>
        <div className={styles.cards}>
          <LanguageCard
            language="jp"
            title="Японский"
            description={t('ui', 'language_select_jp_description')}
            onSelect={handleSelectLanguage}
          />
          <LanguageCard
            language="cn"
            title="Китайский"
            description={t('ui', 'language_select_cn_description')}
            onSelect={handleSelectLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;