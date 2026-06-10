import type { Locale } from './index';
import ru from './ru.json';
import en from './en.json';

const dicts: Record<Locale, typeof ru> = { ru, en: en as typeof ru };

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'ru';
  return /\ben[-_]/.test(acceptLanguage) ? 'en' : 'ru';
}

export function tServer(locale: Locale, category: keyof typeof ru, key: string): string {
  const section = dicts[locale][category] as Record<string, string>;
  const fallback = dicts.ru[category] as Record<string, string>;
  return section?.[key] ?? fallback?.[key] ?? key;
}
