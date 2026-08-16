import { type Translate } from '@/shared/i18n';
import { type DayActivity } from '../api/types';
import { pluralize } from './plural';

/**
 * Formatting for the activity heatmap.
 *
 * Dates arrive as plain ISO calendar strings (`2026-08-16`) and are formatted by
 * splitting the string, never by constructing a `Date` — `new Date('2026-08-16')`
 * parses as midnight **UTC**, so for anyone west of Greenwich it renders as the day
 * before. The backend already decided which day each review belongs to in the user's
 * timezone; re-deriving that here is how the two end up disagreeing.
 *
 * Month and weekday names come from the dictionary rather than `Intl`, because the
 * interface language is the app's own `uiLocale`, not the browser's.
 */

/** Day-of-month, as text. */
export function dayOfMonth(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}

/** Zero-based month index. */
export function monthIndex(isoDate: string): number {
  return Number(isoDate.slice(5, 7)) - 1;
}

/**
 * Weekday index with **Monday as 0**, matching the calendar grid's columns.
 *
 * Computed from the date parts via `Date.UTC`, which is safe precisely because both
 * the input and the output are timezone-free: it asks "what weekday is this calendar
 * date", not "what time is it".
 */
export function weekdayIndex(isoDate: string): number {
  const year = Number(isoDate.slice(0, 4));
  const month = monthIndex(isoDate);
  const day = dayOfMonth(isoDate);
  return (new Date(Date.UTC(year, month, day)).getUTCDay() + 6) % 7;
}

/** «29 июн» — a short day-and-month label. */
export function shortDate(isoDate: string, t: Translate): string {
  return `${dayOfMonth(isoDate)} ${t('review', `month_${monthIndex(isoDate)}`)}`;
}

/** «14 авг, пятница» — the day-detail panel's heading. */
export function longDate(isoDate: string, t: Translate): string {
  return `${shortDate(isoDate, t)}, ${t('review', `weekday_full_${weekdayIndex(isoDate)}`)}`;
}

/** «29 июн — сегодня» — the range caption over the grid. */
export function rangeLabel(days: DayActivity[], t: Translate): string {
  const first = days[0];
  if (!first) return '';
  return `${shortDate(first.date, t)} — ${t('review', 'activity_range_to_today')}`;
}

/** Weekday column headers, Monday first — a tuple, because the grid has seven columns. */
export function weekdayLabels(t: Translate) {
  return [
    t('review', 'weekday_0'),
    t('review', 'weekday_1'),
    t('review', 'weekday_2'),
    t('review', 'weekday_3'),
    t('review', 'weekday_4'),
    t('review', 'weekday_5'),
    t('review', 'weekday_6'),
  ] as const;
}

/**
 * «30 мин» / «1 ч 30 мин», or an em dash when the day carries no timing at all.
 *
 * `null` and `0` are deliberately different: null means every review that day
 * predates time tracking, and rendering it as "0 мин" would claim the user studied
 * for no time rather than admitting the number isn't known.
 */
export function formatDuration(seconds: number | null, t: Translate): string {
  if (seconds === null) return t('review', 'value_none');
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} ${t('review', 'unit_minutes_short')}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursPart = `${hours} ${t('review', 'unit_hours_short')}`;
  return rest === 0 ? hoursPart : `${hoursPart} ${rest} ${t('review', 'unit_minutes_short')}`;
}

/** «1 карточка» · «3 карточки» · «5 карточек». */
export function pluralCards(count: number, t: Translate): string {
  return pluralize(count, 'cards', t);
}

/** Accessible name for one heatmap cell. */
export function cellLabel(day: DayActivity, t: Translate): string {
  const date = longDate(day.date, t);
  return day.reviews === 0
    ? `${date}, ${t('review', 'activity_not_studied')}`
    : `${date}, ${day.reviews} ${t('review', 'activity_day_reviews')}`;
}
