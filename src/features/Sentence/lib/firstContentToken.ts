import { type SentenceToken } from '@/shared/api/types';
import { posToEntry } from './posToEntry';

/**
 * Index of the first token worth inspecting — a noun, verb or pronoun rather than a
 * particle or a token with no recognised part of speech.
 *
 * A freshly parsed sentence selects nothing on its own, which would leave the detail
 * column empty until the user clicks. Landing on 私 says more than landing on は, so the
 * leading particle-ish tokens are skipped. Falls back to the first token when nothing
 * qualifies (a sentence of pure particles is unusual but not impossible).
 */
export const firstContentTokenIndex = (
  tokens: SentenceToken[],
  language: 'jp' | 'cn' | null,
): number => {
  const index = tokens.findIndex((token) => {
    const pos = posToEntry(token, language);
    return pos === 'noun' || pos === 'verb' || pos === 'pronoun';
  });

  return index === -1 ? 0 : index;
};
