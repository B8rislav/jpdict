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
/** Values substituted into a string's `{name}` placeholders. */
export type TranslateVars = Record<string, string | number>;

export type Translate = <C extends Category>(
  category: C,
  key: string,
  vars?: TranslateVars,
) => string;

export function translate<C extends Category>(
  locale: Locale,
  category: C,
  key: string,
  vars?: TranslateVars,
): string {
  const section = dicts[locale][category] as Record<string, string> | undefined;
  const fallback = dicts.ru[category] as Record<string, string> | undefined;
  const text = section?.[key] ?? fallback?.[key] ?? key;
  return vars ? interpolate(text, vars) : text;
}

/**
 * Substitute `{name}` placeholders.
 *
 * Sentences with a number in the middle used to be assembled by concatenating two
 * or three keys at the call site («4» + «из» + «10» + «карточек»), which forces
 * every language into Russian's word order and hides the real sentence from whoever
 * is translating it. An unknown placeholder is left as-is rather than blanked, so a
 * missing variable shows up as `{done}` instead of silently losing a number.
 */
function interpolate(text: string, vars: TranslateVars): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** A translator bound to one locale — what `useT()` hands to components. */
export function createTranslate(locale: Locale): Translate {
  return (category, key, vars) => translate(locale, category, key, vars);
}
