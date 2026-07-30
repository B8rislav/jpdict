/**
 * Server-only translation entry point, for `generateMetadata` and anything else
 * outside the React tree (where `useT()` isn't available).
 *
 * Both this and `useT()` now route through the same pure `translate`, so there
 * is one lookup implementation rather than two copies that can drift.
 */
export { translate as tServer, type Category } from './dictionaries';
export { detectLocale, DEFAULT_LOCALE, type Locale } from './locale';
