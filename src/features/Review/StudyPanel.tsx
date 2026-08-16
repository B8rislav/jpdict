'use client';

import { useUnit } from 'effector-react';
import { useEffect, type FC } from 'react';

import { useProfile } from '@/shared/profile/context';
import { $isAuthenticated } from '@/stores/auth';
import { $activity, $stats, fetchActivityFx, fetchStatsFx } from './model';
import { ActivityView } from './ui/ActivityView';
import { StudyDashboardView } from './ui/StudyDashboardView';

type Props = {
  onStart: () => void;
};

/**
 * Wires the dashboard's data. Both requests go out together — the counts and the
 * history are independent, and the page shows skeletons until the counts land.
 */
export const StudyPanel: FC<Props> = ({ onStart }) => {
  const isAuthenticated = useUnit($isAuthenticated);
  const { selectedLanguage } = useProfile();
  const [stats, activity, loading] = useUnit([$stats, $activity, fetchStatsFx.pending]);

  // Reloaded whenever the dashboard is shown (mount) or the study language changes.
  // This is also what refreshes the heatmap after a session: the session unmounts
  // this panel, so returning to it remounts and refetches — one request per session
  // rather than one per graded card.
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStatsFx();
    fetchActivityFx();
  }, [isAuthenticated, selectedLanguage]);

  return (
    <StudyDashboardView
      stats={stats}
      activity={activity}
      loading={loading && stats === null}
      onStart={onStart}
    >
      <ActivityView activity={activity} />
    </StudyDashboardView>
  );
};
