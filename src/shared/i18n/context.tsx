'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createTranslate, type Translate } from './dictionaries';
import { DEFAULT_LOCALE, type Locale } from './locale';

interface LocaleContextValue {
  locale: Locale;
  t: Translate;
}

/**
 * Context rather than a module global so the locale is per-render-tree: SSR of
 * two concurrent requests can't leak into each other, and switching locale
 * re-renders only the components that actually translate.
 */
const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: createTranslate(DEFAULT_LOCALE),
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslate(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** The bound translator: `const t = useT()` then `t('ui', 'nav_login')`. */
export function useT(): Translate {
  return useContext(LocaleContext).t;
}

/** The active locale — for `Intl` formatting and API `def_lang` params. */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}
