import { type Translate } from '@/shared/i18n';

/**
 * Pick a plural form by count and render it after the number.
 *
 * Russian has three forms chosen by the last digits, so an invariant noun is wrong
 * most of the time — «3 карточек» and «4 день» read as broken to a native speaker,
 * and Russian is this app's default interface language. English collapses `few` and
 * `many` onto one plural, which the dictionary encodes rather than this code.
 *
 * `prefix` names a trio of keys in the `review` category: `<prefix>_one`,
 * `<prefix>_few`, `<prefix>_many`.
 */
export function pluralize(count: number, prefix: string, t: Translate): string {
  return `${count} ${t('review', `${prefix}_${pluralForm(count)}`)}`;
}

function pluralForm(count: number): 'one' | 'few' | 'many' {
  const mod10 = count % 10;
  const mod100 = count % 100;
  // 11–14 are the exception that makes the last-digit rule alone wrong.
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
}
