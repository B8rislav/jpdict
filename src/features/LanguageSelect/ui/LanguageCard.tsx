'use client';

import { type Language } from '@/shared/api/types';
// `../LanguageSelect.module.css` was deleted in an earlier refactor; its `card*` /
// `selectButton` rules live here. The stale path type-checked because `css-modules.d.ts`
// declares `*.module.css` as a wildcard, so it only failed at runtime — which is why both
// LanguageSelect stories were failing to load.
import styles from './LanguageSelectView.module.css';
import { useT } from '@/shared/i18n';

interface LanguageCardProps {
  language: Language;
  title: string;
  description: string;
  onSelect: (language: Language) => void;
}

const LanguageCard = ({ language, title, description, onSelect }: LanguageCardProps) => {
  const t = useT();
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardDescription}>{description}</p>
      <button className={styles.selectButton} onClick={() => onSelect(language)}>
        {t('ui', 'select_button')}
      </button>
    </div>
  );
};

export default LanguageCard;
