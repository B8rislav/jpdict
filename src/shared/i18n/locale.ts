/**
 * Locale primitives, deliberately free of dictionary imports so server code,
 * client code, and the profile module can all depend on this without pulling
 * in every translation string.
 */

export const LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick the best supported locale from an `Accept-Language` header.
 *
 * Honours quality values. The previous implementation tested `/\ben[-_]/`
 * against the whole header, which matched English *anywhere* in the list — so
 * `ru-RU,ru;q=0.9,en-US;q=0.8` (stock Chrome on a Russian system with English
 * as a secondary) resolved to English. Ranking by q-value fixes that.
 *
 * Only ever a first-visit default: a stored preference always wins.
 */
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((param) => /^\s*q=/i.test(param));
      const match = qParam === undefined ? null : /^\s*q=([\d.]+)\s*$/i.exec(qParam);
      return {
        // `en-US` and `en_us` both reduce to `en`.
        language: tag.trim().toLowerCase().split(/[-_]/)[0],
        // A q that's present but unparseable makes the entry malformed; drop it
        // rather than silently promoting it to the default weight of 1.
        quality: qParam === undefined ? 1 : match ? Number.parseFloat(match[1]) : Number.NaN,
      };
    })
    .filter((entry) => entry.language && Number.isFinite(entry.quality) && entry.quality > 0)
    // Stable sort keeps header order among equal q-values, which is the
    // tie-break Accept-Language specifies.
    .sort((a, b) => b.quality - a.quality);

  for (const { language } of ranked) {
    if (isLocale(language)) return language;
  }

  return DEFAULT_LOCALE;
}
