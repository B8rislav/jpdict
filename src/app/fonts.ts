import {
  Golos_Text,
  Noto_Sans_JP,
  Noto_Sans_SC,
  Noto_Serif_JP,
  Noto_Serif_SC,
} from 'next/font/google';

/**
 * The app's typefaces, and the only place they are declared.
 *
 * Designoslav *names* its faces in `--do-font-sans` / `--do-font-serif` / `--do-font-cjk`
 * but never fetches them — loading is the consuming app's job. These declarations are
 * what make those tokens resolve; `globals.css` maps the generated variables onto them.
 *
 * Lives outside `layout.tsx` because that file is capped at `max-lines: 100` and five
 * font declarations would eat most of the budget.
 */

/** UI voice: Latin + Cyrillic. Replaces the never-loaded Inter the tokens used to name. */
export const golosText = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * Display serif — section headings, headwords, the brand mark.
 *
 * Two weights, not four, and the reason matters: Google splits a CJK family into ~100
 * unicode-range files *per weight*, so each extra weight is ~100 more downloads at build
 * time. Asking for 400/500/600/700 here reliably hit `ETIMEDOUT`, and `next/font` responds
 * by silently falling back to Georgia — a broken serif that still builds green. Display
 * text only ever uses regular (headwords) and semibold (headings), so ask for those.
 */
export const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600'],
  variable: '--font-serif',
  display: 'swap',
});

/**
 * The SC cut of the display serif. Noto Serif JP has no Simplified Chinese glyph forms,
 * so CN mode would otherwise render Chinese headwords in Japanese shapes — `globals.css`
 * swaps to this under `[data-lang='cn']`.
 */
export const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif-sc',
  display: 'swap',
});

/** CJK body text, Japanese glyph forms. */
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-jp',
  display: 'swap',
});

/** CJK body text, Simplified Chinese glyph forms. */
export const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sc',
  display: 'swap',
});

/** Every font variable, for the `<html>` className. */
export const fontVariables = [
  golosText.variable,
  notoSerifJP.variable,
  notoSerifSC.variable,
  notoSansJP.variable,
  notoSansSC.variable,
].join(' ');
