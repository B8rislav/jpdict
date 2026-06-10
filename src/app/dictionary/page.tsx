'use client';

import { Label, Text } from '@gravity-ui/uikit';
import Link from 'next/link';
import { useEffect } from 'react';
import { useUnit } from 'effector-react';

import { $savedWords, DictionaryPanel, loadDictionaryFx } from '@/features/Dictionary';
import { AuthGate } from '@/features/Auth/AuthGate';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';
import { $stats, fetchStatsFx } from '@/stores/review';
import { t } from '@/shared/i18n';
import styles from './page.module.css';

export default function DictionaryPage() {
  const savedWords = useUnit($savedWords);
  const isAuthenticated = useUnit($isAuthenticated);
  const { uiLocale, selectedLanguage } = useUnit($userProfile);
  const stats = useUnit($stats);

  useEffect(() => {
    if (isAuthenticated) {
      loadDictionaryFx();
      fetchStatsFx();
    }
  }, [isAuthenticated, selectedLanguage]);

  const wordCountLabel = t('dict_count', new Intl.PluralRules(uiLocale).select(savedWords.length));
  const due = stats?.due ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          {t('ui', 'settings_back')}
        </Link>
        <Text variant="display-1">{t('ui', 'dict_title')}</Text>
        {due > 0 && (
          <Link href="/study" style={{ textDecoration: 'none' }}>
            <Label theme="info" size="m">
              {t('review', 'count_due')}: {due}
            </Label>
          </Link>
        )}
      </div>
      <AuthGate title={t('ui', 'dict_personal')}>
        <Text className={styles.count} variant="body-2">
          {savedWords.length} {wordCountLabel}
        </Text>
        <DictionaryPanel />
      </AuthGate>
    </div>
  );
}
