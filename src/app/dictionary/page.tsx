'use client';

import { Text } from '@gravity-ui/uikit';
import Link from 'next/link';
import { useEffect } from 'react';
import { useUnit } from 'effector-react';

import { $savedWords, DictionaryPanel, loadDictionaryFx } from '@/features/Dictionary';
import styles from './page.module.css';

export default function DictionaryPage() {
  const savedWords = useUnit($savedWords);

  useEffect(() => {
    loadDictionaryFx();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>← Назад</Link>
        <Text variant="display-1">Словарь</Text>
        <Text className={styles.count} variant="body-2">
          {savedWords.length} {pluralize(savedWords.length)}
        </Text>
      </div>
      <DictionaryPanel />
    </div>
  );
}

function pluralize(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'слово';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'слова';
  return 'слов';
}
