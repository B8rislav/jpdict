'use client';

import { type Language } from '../../stores/userProfile';
import styles from './LanguageSelect.module.css';

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
        Выбрать
      </button>
    </div>
  );
};

export default LanguageCard;