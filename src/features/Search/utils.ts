export type LanguageMode = 'jp' | 'cn' | null;
export type SearchQueryType = 'kanji' | 'word' | 'sentence';

const isSingleCharacter = (text: string) => text.trim().length === 1;
const containsJapanese = (text: string) => /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
const containsChinese = (text: string) => /[\p{Script=Han}]/u.test(text);
const containsSpace = (text: string) => /\s/.test(text);

export function classifySearchQuery(value: string, mode: LanguageMode): SearchQueryType {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'word';
  }

  if (mode === 'jp') {
    if (isSingleCharacter(trimmed)) {
      return 'kanji';
    }

    if (containsJapanese(trimmed) && containsSpace(trimmed)) {
      return 'sentence';
    }

    if (trimmed.length > 6) {
      return 'sentence';
    }

    return 'word';
  }

  if (mode === 'cn') {
    if (isSingleCharacter(trimmed)) {
      return 'word';
    }

    if (containsSpace(trimmed) || trimmed.length > 6) {
      return 'sentence';
    }

    if (containsChinese(trimmed)) {
      return 'word';
    }

    return 'word';
  }

  if (isSingleCharacter(trimmed)) {
    return 'kanji';
  }

  if (containsSpace(trimmed) || trimmed.length > 8) {
    return 'sentence';
  }

  return 'word';
}
