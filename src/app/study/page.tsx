'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthGate } from '@/features/Auth/AuthGate';
import { SessionPanel, StudyPanel } from '@/features/Review';
import { type CardType } from '@/shared/api/types';
import { useT } from '@/shared/i18n';

import styles from './page.module.css';

/** `?deck=kanji` scopes a session to one deck; anything else studies both. */
function useDeck(): CardType | undefined {
  const deck = useSearchParams().get('deck');
  return deck === 'kanji' || deck === 'word' ? deck : undefined;
}

function StudyBody() {
  const t = useT();
  const router = useRouter();
  const deck = useDeck();
  // A deck link from /dictionary («Учить →») opens straight into a session; landing
  // on /study with no deck shows the dashboard first.
  const [studying, setStudying] = useState(deck !== undefined);

  return (
    <AuthGate title={t('review', 'title')}>
      {studying ? (
        <SessionPanel
          deck={deck}
          onExit={() => setStudying(false)}
          onFinish={() => router.push('/dictionary')}
        />
      ) : (
        <StudyPanel onStart={() => setStudying(true)} />
      )}
    </AuthGate>
  );
}

export default function StudyPage() {
  return (
    <div className={styles.page}>
      {/* useSearchParams needs a Suspense boundary to keep the route static. */}
      <Suspense>
        <StudyBody />
      </Suspense>
    </div>
  );
}
