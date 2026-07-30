'use client';

import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';

import {
  $current,
  $queue,
  $stats,
  fetchQueueFx,
  fetchStatsFx,
  gradeCurrent,
  ReviewCard,
  StudyDashboard,
} from '@/features/Review';
import { AuthGate } from '@/features/Auth/AuthGate';
import { useT } from '@/shared/i18n';
import { $isAuthenticated } from '@/stores/auth';

import styles from './page.module.css';
import { useProfile } from '@/shared/profile/context';

export default function StudyPage() {
  const t = useT();
  const isAuthenticated = useUnit($isAuthenticated);
  const { selectedLanguage } = useProfile();
  const stats = useUnit($stats);
  const current = useUnit($current);
  const queue = useUnit($queue);
  const [studying, setStudying] = useState(false);

  // Load the dashboard counts whenever auth or study language changes.
  useEffect(() => {
    if (isAuthenticated) fetchStatsFx();
  }, [isAuthenticated, selectedLanguage]);

  const readingLabel = t('ui', selectedLanguage === 'cn' ? 'reading_label_cn' : 'reading_label_jp');

  const startSession = () => {
    setStudying(true);
    fetchQueueFx();
  };

  const endSession = () => {
    setStudying(false);
    fetchStatsFx();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          {t('ui', 'settings_back')}
        </Link>
        <Text variant="display-1">{t('review', 'title')}</Text>
      </div>

      <AuthGate title={t('review', 'title')}>
        {!studying ? (
          <StudyDashboard stats={stats} onStart={startSession} />
        ) : current ? (
          <div className={styles.session}>
            <Text variant="caption-2" color="secondary" className={styles.remaining}>
              {queue.length}
            </Text>
            <AnimatePresence mode="wait">
              <ReviewCard
                key={current.id}
                card={current}
                readingLabel={readingLabel}
                onGrade={gradeCurrent}
              />
            </AnimatePresence>
          </div>
        ) : (
          <div className={styles.done}>
            <Text variant="subheader-2">{t('review', 'session_done')}</Text>
            <Button size="l" variant="primary" onClick={endSession}>
              {t('review', 'dashboard_back')}
            </Button>
          </div>
        )}
      </AuthGate>
    </div>
  );
}
