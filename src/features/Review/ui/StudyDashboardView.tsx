'use client';

import {
  Button,
  DailyGoal,
  SectionHeading,
  Skeleton,
  StatTile,
  StreakBadge,
  type StreakDay,
} from 'designoslav';
import { type FC, type ReactNode } from 'react';

import { useT } from '@/shared/i18n';
import { type ReviewActivity, type ReviewStats } from '../api/types';
import { pluralCards, weekdayIndex, weekdayLabels } from '../lib/activity';
import styles from './StudyDashboardView.module.css';

type Props = {
  stats: ReviewStats | null;
  activity: ReviewActivity | null;
  /** True until the first stats response lands — drives the skeletons. */
  loading: boolean;
  onStart: () => void;
  /** The activity heatmap, composed by the container. */
  children?: ReactNode;
};

/**
 * The pre-session dashboard: goal ring, streak, three counts, the activity grid, and
 * the CTA into a session.
 *
 * Every widget renders even for an account with no history — a zeroed streak and an
 * empty grid teach what the app tracks, where hiding them would leave a new user a
 * page that changes shape as they use it.
 */
export const StudyDashboardView: FC<Props> = ({ stats, activity, loading, onStart, children }) => {
  const t = useT();
  const due = stats?.due ?? 0;
  const newCount = stats?.new ?? 0;
  const learned = stats?.learned ?? 0;
  const pending = due + newCount;

  return (
    <div className={styles.dashboard}>
      <SectionHeading as="h1">
        <span className={styles.native}>復習</span> {t('review', 'title')}
      </SectionHeading>

      {loading ? (
        <Skeleton shape="block" className={styles.headerSkeleton} />
      ) : (
        <div className={styles.header}>
          <DailyGoal
            value={stats?.doneToday ?? 0}
            target={stats?.dailyGoal ?? 0}
            label={t('review', 'goal_title')}
            caption={t('review', 'goal_progress', {
              done: stats?.doneToday ?? 0,
              target: stats?.dailyGoal ?? 0,
            })}
          />
          <StreakBadge
            count={activity?.streak ?? 0}
            label={t('review', 'streak_days')}
            days={streakWeek(activity, weekdayLabels(t))}
            calendarLabel={t('review', 'activity_title')}
          />
        </div>
      )}

      {loading ? (
        <Skeleton shape="block" className={styles.countsSkeleton} />
      ) : (
        <div className={styles.counts}>
          <StatTile tone="primary" value={due} label={t('review', 'count_due')} />
          <StatTile tone="neutral" value={newCount} label={t('review', 'count_new')} />
          <StatTile tone="muted" value={learned} label={t('review', 'count_learned')} />
        </div>
      )}

      {loading ? <Skeleton shape="block" className={styles.gridSkeleton} /> : children}

      <Button
        size="xl"
        variant="primary"
        fullWidth
        disabled={loading || pending === 0}
        onClick={onStart}
      >
        {pending === 0 && !loading
          ? t('review', 'all_caught_up')
          : `${t('review', 'start')} · ${pluralCards(pending, t)}`}
      </Button>
    </div>
  );
};

/**
 * The current week as streak dots, Monday first.
 *
 * Read off the tail of the activity series rather than recomputed from a clock: the
 * series already ends on the user's today, in the user's timezone, so the dots and
 * the grid can't disagree about which day is which.
 */
function streakWeek(activity: ReviewActivity | null, labels: readonly string[]): StreakDay[] {
  // Single letters under the dots — «Пн» → «П», "Mon" → "M".
  const initials = labels.map((label) => label.slice(0, 1));
  const days = activity?.days ?? [];
  const today = days[days.length - 1];
  if (!today) return initials.map((label) => ({ label, state: 'upcoming' }));

  const todayColumn = weekdayIndex(today.date);
  const week = days.slice(-(todayColumn + 1));

  return initials.map((label, column) => {
    const day = week[column];
    const state = column > todayColumn ? 'upcoming' : column === todayColumn ? 'today' : 'done';
    return {
      label,
      // A past day with no reviews isn't part of the streak, so it reads faint
      // rather than filled — the dots must agree with the number beside them.
      state: state === 'done' && (day?.reviews ?? 0) === 0 ? 'upcoming' : state,
    };
  });
}
