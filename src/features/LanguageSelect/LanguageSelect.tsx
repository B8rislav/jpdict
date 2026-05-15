'use client';

import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { $userProfile, loadUserProfile, setSelectedLanguage, type Language } from '../../stores/userProfile';
import LanguageCard from './LanguageCard';
import styles from './LanguageSelect.module.css';

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
        <h1 className={styles.title}>Выберите язык обучения</h1>
        <div className={styles.cards}>
          <LanguageCard
            language="jp"
            title="Японский"
            description="Три системы письма: хирагана, катакана и кандзи. Уровни JLPT для оценки прогресса."
            onSelect={handleSelectLanguage}
          />
          <LanguageCard
            language="cn"
            title="Китайский"
            description="Тональная система произношения. Уровни HSK для измерения владения языком."
            onSelect={handleSelectLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;