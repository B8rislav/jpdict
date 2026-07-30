'use client';

import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { motion } from 'motion/react';
import { type FC } from 'react';

import { DURATION, EASE, TAP_SCALE, useReducedMotion } from '@/shared/motion';
import { CountUp } from '@/shared/ui/CountUp';
import { useT } from '@/shared/i18n';
import { type ReviewStats } from '../api/types';
import styles from './StudyDashboard.module.css';

type Props = {
  stats: ReviewStats | null;
  onStart: () => void;
};

export const StudyDashboard: FC<Props> = ({ stats, onStart }) => {
  const t = useT();
  const reduced = useReducedMotion();
  const due = stats?.due ?? 0;
  const newCount = stats?.new ?? 0;
  const learned = stats?.learned ?? 0;
  const hasCards = due + newCount > 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.counts}>
        <div className={styles.count}>
          <Text variant="display-2">
            <CountUp value={due} />
          </Text>
          <Text variant="caption-2" color="secondary">
            {t('review', 'count_due')}
          </Text>
        </div>
        <div className={styles.count}>
          <Text variant="display-2">
            <CountUp value={newCount} />
          </Text>
          <Text variant="caption-2" color="secondary">
            {t('review', 'count_new')}
          </Text>
        </div>
        <div className={styles.count}>
          <Text variant="display-2">
            <CountUp value={learned} />
          </Text>
          <Text variant="caption-2" color="secondary">
            {t('review', 'count_learned')}
          </Text>
        </div>
      </div>

      {hasCards ? (
        <motion.div
          className={styles.startWrap}
          // One-shot "breathe" after the counters settle, inviting the click.
          initial={reduced ? false : { scale: 1 }}
          animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
          transition={
            reduced ? { duration: 0 } : { duration: 0.7, ease: EASE, delay: DURATION.slow }
          }
          whileHover={reduced ? undefined : { scale: 1.02 }}
          whileTap={reduced ? undefined : { scale: TAP_SCALE }}
        >
          <Button size="xl" variant="primary" onClick={onStart}>
            {t('review', 'start')}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: DURATION.slow, ease: EASE }}
        >
          <Text variant="body-2" color="secondary" className={styles.empty}>
            {t('review', 'all_caught_up')}
          </Text>
        </motion.div>
      )}
    </div>
  );
};
