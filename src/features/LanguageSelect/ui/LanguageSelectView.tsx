'use client';

import { type FC } from 'react';

import { type Language } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import LanguageCard from './LanguageCard';
import styles from './LanguageSelectView.module.css';

export type LanguageSelectViewProps = {
  onSelect: (language: Language) => void;
};

/** First-run overlay asking which language the visitor is here to study. */
export const LanguageSelectView: FC<LanguageSelectViewProps> = ({ onSelect }) => {
  const t = useT();

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('ui', 'language_select_title')}</h1>
        <div className={styles.cards}>
          <LanguageCard
            language="jp"
            title={t('ui', 'lang_jp')}
            description={t('ui', 'language_select_jp_description')}
            onSelect={onSelect}
          />
          <LanguageCard
            language="cn"
            title={t('ui', 'lang_cn')}
            description={t('ui', 'language_select_cn_description')}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
};
