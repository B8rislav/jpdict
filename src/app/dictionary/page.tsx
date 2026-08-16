'use client';

import { SectionHeading } from 'designoslav';
import { useUnit } from 'effector-react';
import { Suspense } from 'react';

import { AuthGate } from '@/features/Auth/AuthGate';
import { $deckSummaries, DictionaryPanel } from '@/features/Dictionary';

import { useT } from '@/shared/i18n';
import styles from './page.module.css';

export default function DictionaryPage() {
  const t = useT();
  const decks = useUnit($deckSummaries);

  const total = decks.reduce((sum, deck) => sum + deck.total, 0);
  const today = decks.reduce((sum, deck) => sum + deck.due + deck.newToday, 0);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <SectionHeading as="h1">
          <span className={styles.native}>{t('ui', 'dict_title_native')}</span>{' '}
          {t('ui', 'dict_title')}
        </SectionHeading>
        <span className={styles.counts}>
          {total} {t('ui', 'dict_cards_total')} · {t('ui', 'dict_today_total')} {today}
        </span>
      </div>

      <AuthGate title={t('ui', 'dict_personal')}>
        {/* useSearchParams needs a Suspense boundary to keep the route prerenderable. */}
        <Suspense fallback={null}>
          <DictionaryPanel />
        </Suspense>
      </AuthGate>
    </main>
  );
}
