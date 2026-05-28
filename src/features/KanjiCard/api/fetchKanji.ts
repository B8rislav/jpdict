import { fetchData } from '@/shared/api/fetchData';
import { type BackendHanziCard, type BackendKanjiCard, type Kanji } from '@/shared/api/types';
import { CJK_REGEX } from '@/shared/utils/cjk';
import { backendCardToKanji, backendHanziCardToKanji } from './mappers';
import { getLocale } from '@/shared/i18n';

export type KanjiResponse = Kanji[];

export async function fetchKanji(
  value: string,
  language: 'jp' | 'cn' | null,
): Promise<KanjiResponse> {
  const chars = [...value].filter((c) => CJK_REGEX.test(c));
  if (!chars.length) return [];

  if (language === 'jp') {
    const results = await Promise.allSettled(
      chars.map((char) => fetchData<BackendKanjiCard>(`kanji/${encodeURIComponent(char)}?def_lang=${getLocale()}`)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<BackendKanjiCard> => r.status === 'fulfilled')
      .map((r) => backendCardToKanji(r.value));
  }

  if (language === 'cn') {
    const results = await Promise.allSettled(
      chars.map((char) => fetchData<BackendHanziCard>(`hanzi/${encodeURIComponent(char)}?def_lang=${getLocale()}`)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<BackendHanziCard> => r.status === 'fulfilled')
      .map((r) => backendHanziCardToKanji(r.value));
  }

  return [];
}
