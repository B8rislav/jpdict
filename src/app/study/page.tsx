'use client';

import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';

import { ReviewCard, StudyDashboard } from '@/features/Review';
import { AuthGate } from '@/features/Auth/AuthGate';
import { t } from '@/shared/i18n';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';
import {
  $current,
  $queue,
  $stats,
  fetchQueueFx,
  fetchStatsFx,
  gradeCurrent,
} from '@/stores/review';
import styles from './page.module.css';

export default function StudyPage() {
  const isAuthenticated = useUnit($isAuthenticated);
  const { selectedLanguage } = useUnit($userProfile);
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
