import en from './en.json';
import ru from './ru.json';
import { type Locale } from './locale';

export type Dict = typeof ru;
export type Category = keyof Dict;

const dicts: Record<Locale, Dict> = { ru, en: en as Dict };

/**
 * Look up a string, falling back to Russian and finally to the key itself.
 *
 * Pure: the locale is always an argument. It used to read a module-level
 * `currentLocale`, which is a single mutable slot shared by every concurrent
 * SSR render in the Node process — two overlapping requests could hand each
 * other the wrong language.
 */
export type Translate = <C extends Category>(category: C, key: string) => string;

export function translate<C extends Category>(locale: Locale, category: C, key: string): string {
  const section = dicts[locale][category] as Record<string, string> | undefined;
  const fallback = dicts.ru[category] as Record<string, string> | undefined;
  return section?.[key] ?? fallback?.[key] ?? key;
}

/** A translator bound to one locale — what `useT()` hands to components. */
export function createTranslate(locale: Locale): Translate {
  return (category, key) => translate(locale, category, key);
}
