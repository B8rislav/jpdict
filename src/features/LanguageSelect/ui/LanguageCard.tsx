'use client';

import { type Language } from '@/shared/api/types';
import styles from '../LanguageSelect.module.css';
import { t } from '@/shared/i18n';

interface LanguageCardProps {
  language: Language;
  title: string;
  description: string;
  onSelect: (language: Language) => void;
}

const LanguageCard = ({ language, title, description, onSelect }: LanguageCardProps) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardDescription}>{description}</p>
      <button
        className={styles.selectButton}
        onClick={() => onSelect(language)}
      >
        {t('ui', 'select_button')}
      </button>
    </div>
  );
};

export default LanguageCard;