import ru from './ru.json';
import en from './en.json';

type Dict = typeof ru;
export type Locale = 'ru' | 'en';

const dicts: Record<Locale, Dict> = { ru, en: en as Dict };
let currentLocale: Locale = 'ru';

export const setLocale = (l: Locale) => { currentLocale = l; };
export const getLocale = (): Locale => currentLocale;

export const t = <C extends keyof Dict>(category: C, key: string): string =>
  (dicts[currentLocale][category] as Record<string, string>)?.[key]
    ?? (dicts.ru[category] as Record<string, string>)?.[key]
    ?? key;
