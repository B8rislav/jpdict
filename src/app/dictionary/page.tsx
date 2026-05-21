'use client';

import { Text } from '@gravity-ui/uikit';
import Link from 'next/link';
import { useEffect } from 'react';
import { useUnit } from 'effector-react';

import { $savedWords, DictionaryPanel, loadDictionaryFx } from '@/features/Dictionary';
import { AuthGate } from '@/shared/ui/AuthGate';
import { $isAuthenticated } from '@/stores/auth';
import styles from './page.module.css';

export default function DictionaryPage() {
  const savedWords = useUnit($savedWords);
  const isAuthenticated = useUnit($isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) loadDictionaryFx();
  }, [isAuthenticated]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>← Назад</Link>
        <Text variant="display-1">Словарь</Text>
      </div>
      <AuthGate title="Личный словарь">
        <Text className={styles.count} variant="body-2">
          {savedWords.length} {pluralize(savedWords.length)}
        </Text>
        <DictionaryPanel />
      </AuthGate>
    </div>
  );
}

function pluralize(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'слово';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'слова';
  return 'слов';
}
