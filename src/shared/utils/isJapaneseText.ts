/**
 * Determines if a string contains valid Japanese text suitable for morphological analysis
 *
 * Heuristics:
 * - Must contain at least one hiragana, katakana, or kanji character
 * - Should not have spaces in the middle of the sentence (spaces at edges are trimmed)
 * - Empty strings return false
 */
export const isJapaneseText = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const trimmed = text.trim();

  // Check for hiragana, katakana, or kanji
  const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(trimmed);

  if (!hasJapaneseChars) {
    return false;
  }

  // Check for spaces in the middle (not at edges)
  const hasMiddleSpaces = /\s+.+\s+/.test(trimmed) || /\s{2,}/.test(trimmed);

  if (hasMiddleSpaces) {
    return false;
  }

  return true;
};
