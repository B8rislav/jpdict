import { type EntryPartOfSpeech } from 'designoslav';
import { type SentenceToken } from '@/shared/api/types';

/**
 * Map a token's part of speech onto Designoslav's four accent categories
 * (noun/verb/particle/pronoun). Anything outside those returns `undefined`, which
 * renders an entry with no colored accent. Mirrors the JP/CN branches in
 * `posColor.ts`, collapsed to the categories the design system exposes.
 */
export const posToEntry = (
  token: SentenceToken,
  language: 'jp' | 'cn' | null,
): EntryPartOfSpeech | undefined => {
  const pos = token.pos;

  if (language === 'cn') {
    if (pos === 'r' || pos === 'rr' || pos === 'rz' || pos === 'rg') return 'pronoun';
    if (pos.startsWith('v')) return 'verb';
    if (pos.startsWith('n')) return 'noun';
    if (pos === 'p' || pos.startsWith('u') || pos === 'y') return 'particle';
    return undefined;
  }

  switch (pos) {
    case '名詞':
      // Sudachi tags pronouns as 名詞 with a 代名詞 detail.
      return token.pos_detail_1 === '代名詞' ? 'pronoun' : 'noun';
    case '代名詞':
      return 'pronoun';
    case '動詞':
      return 'verb';
    case '助詞':
    case '助動詞':
      return 'particle';
    default:
      return undefined;
  }
};
