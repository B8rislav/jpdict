import { type SentenceToken } from '@/shared/api/types';

/**
 * A piece of the original sentence: either a `token` span (tied to a token by
 * its index) or a `plain` run of characters that sits between/around surfaces
 * (punctuation, whitespace, or anything that didn't line up with a token).
 */
export type SentenceSegment =
  | { type: 'token'; text: string; tokenIndex: number }
  | { type: 'plain'; text: string };

/**
 * Split `sentence` into ordered segments, consuming each token's
 * `surface_form` in turn. The sentence is not necessarily a plain
 * concatenation of surfaces (there may be spacing/punctuation between them),
 * so we walk the string and match each surface from a moving cursor. Anything
 * that doesn't line up is emitted verbatim as a `plain` segment, which
 * guarantees the joined segment text always reproduces the original sentence
 * exactly — no dropped or duplicated characters.
 */
export const segmentSentence = (sentence: string, tokens: SentenceToken[]): SentenceSegment[] => {
  const segments: SentenceSegment[] = [];
  let cursor = 0;

  tokens.forEach((token, tokenIndex) => {
    const surface = token.surface_form;
    if (!surface) return;

    const idx = sentence.indexOf(surface, cursor);
    if (idx === -1) return; // can't align this surface — leave the cursor be

    if (idx > cursor) {
      segments.push({ type: 'plain', text: sentence.slice(cursor, idx) });
    }
    segments.push({ type: 'token', text: sentence.slice(idx, idx + surface.length), tokenIndex });
    cursor = idx + surface.length;
  });

  if (cursor < sentence.length) {
    segments.push({ type: 'plain', text: sentence.slice(cursor) });
  }

  return segments;
};
