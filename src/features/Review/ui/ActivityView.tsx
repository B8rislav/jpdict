'use client';

import { ActivityCalendar, Badge, MetricTile } from 'designoslav';
import { useState, type FC } from 'react';

import { useT } from '@/shared/i18n';
import { type ReviewActivity } from '../api/types';
import { cellLabel, formatDuration, longDate, rangeLabel, weekdayLabels } from '../lib/activity';
import styles from './ActivityView.module.css';

type Props = {
  activity: ReviewActivity | null;
};

/**
 * The activity heatmap and the panel describing whichever day is open.
 *
 * The open day is local `useState`, not a store: nothing outside this view reacts to
 * it, and the panel's numbers come from the same series the grid is drawn from, so
 * selecting a day costs no request and can't show something the grid disagrees with.
 */
export const ActivityView: FC<Props> = ({ activity }) => {
  const t = useT();
  const [selected, setSelected] = useState<string | null>(null);
  const days = activity?.days ?? [];
  const today = days[days.length - 1]?.date;
  const day = days.find((entry) => entry.date === selected);

  return (
    <ActivityCalendar
      title={t('review', 'activity_title')}
      rangeLabel={rangeLabel(days, t)}
      days={days.map((entry) => ({
        date: entry.date,
        count: entry.reviews,
        label: cellLabel(entry, t),
      }))}
      weekdayLabels={weekdayLabels(t)}
      today={today}
      selectedDate={selected}
      onSelectDate={setSelected}
      legendLessLabel={t('review', 'activity_less')}
      legendMoreLabel={t('review', 'activity_more')}
      detail={
        day && (
          <div className={styles.detail}>
            <div className={styles.heading}>
              <span className={styles.date}>{longDate(day.date, t)}</span>
              <Badge tone={day.reviews > 0 ? 'primary' : 'neutral'} caps>
                {t('review', day.reviews > 0 ? 'activity_studied' : 'activity_not_studied')}
              </Badge>
            </div>
            <div className={styles.metrics}>
              <MetricTile tone="primary" label={t('review', 'day_new')} value={day.new} />
              <MetricTile
                tone="accent"
                label={t('review', 'day_repeats')}
                value={day.reviews - day.new}
              />
              <MetricTile
                tone="info"
                label={t('review', 'day_time')}
                value={formatDuration(day.seconds, t)}
              />
            </div>
          </div>
        )
      }
    />
  );
};
