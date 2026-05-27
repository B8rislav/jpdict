import { fetchData } from '@/shared/api/fetchData';
import { type BackendKanjiCard } from '@/shared/api/types';
import { type Kanji } from '@/shared/api/types';
import { CJK_REGEX } from '@/shared/utils/cjk';
import { backendCardToKanji } from './mappers';

export type KanjiResponse = Kanji[];

export async function fetchKanji(
  value: string,
  language: 'jp' | 'cn' | null,
): Promise<KanjiResponse> {
  if (language !== 'jp') return [];
  const chars = [...value].filter((c) => CJK_REGEX.test(c));
  if (!chars.length) return [];

  const results = await Promise.allSettled(
    chars.map((char) => fetchData<BackendKanjiCard>(`kanji/${encodeURIComponent(char)}`)),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<BackendKanjiCard> => r.status === 'fulfilled')
    .map((r) => backendCardToKanji(r.value));
}
