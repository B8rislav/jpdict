import { type Translate } from '@/shared/i18n';
import { pluralize } from './plural';

/**
 * Interval formatting for review-grade buttons. The scheduling itself (SM-2 +
 * Anki-style learning steps) lives on the backend, which returns the projected
 * seconds-until-due per grade on each card; this only renders that number.
 *
 * `t` arrives as an argument rather than off a module global, so this stays
 * pure and its tests no longer have to mutate shared state to pick a language.
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** A compact, localized interval label from seconds: e.g. "1m", "10m", "4d", "2w", "1y". */
export function formatInterval(seconds: number, t: Translate): string {
  if (seconds < HOUR) return `${Math.round(seconds / MINUTE)} ${t('review', 'unit_minute')}`;
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} ${t('review', 'unit_hour')}`;
  // Days are the interval a user sees most, and the one the mock spells out in
  // full («1 день» · «4 дня») rather than abbreviating.
  if (seconds < WEEK) return pluralize(Math.round(seconds / DAY), 'days', t);
  if (seconds < MONTH) return `${Math.round(seconds / WEEK)} ${t('review', 'unit_week')}`;
  if (seconds < YEAR) return `${Math.round(seconds / MONTH)} ${t('review', 'unit_month')}`;
  return `${Math.round(seconds / YEAR)} ${t('review', 'unit_year')}`;
}
