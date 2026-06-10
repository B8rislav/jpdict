'use client';

import { Button, Text } from '@gravity-ui/uikit';
import { type FC } from 'react';

import { t } from '@/shared/i18n';
import { type ReviewStats } from '../api/types';
import styles from './StudyDashboard.module.css';

type Props = {
  stats: ReviewStats | null;
  onStart: () => void;
};

export const StudyDashboard: FC<Props> = ({ stats, onStart }) => {
  const due = stats?.due ?? 0;
  const newCount = stats?.new ?? 0;
  const learned = stats?.learned ?? 0;
  const hasCards = due + newCount > 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.counts}>
        <div className={styles.count}>
          <Text variant="display-2">{due}</Text>
          <Text variant="caption-2" color="secondary">
            {t('review', 'count_due')}
          </Text>
        </div>
        <div className={styles.count}>
          <Text variant="display-2">{newCount}</Text>
          <Text variant="caption-2" color="secondary">
            {t('review', 'count_new')}
          </Text>
        </div>
        <div className={styles.count}>
          <Text variant="display-2">{learned}</Text>
          <Text variant="caption-2" color="secondary">
            {t('review', 'count_learned')}
          </Text>
        </div>
      </div>

      {hasCards ? (
        <Button size="xl" view="action" onClick={onStart}>
          {t('review', 'start')}
        </Button>
      ) : (
        <Text variant="body-2" color="secondary" className={styles.empty}>
          {t('review', 'all_caught_up')}
        </Text>
      )}
    </div>
  );
};
