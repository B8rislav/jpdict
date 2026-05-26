import { fetchData } from '@/shared/api/fetchData';
import { BackendKanjiCard } from '@/shared/api/types';
import { Kanji } from '../model';

export type KanjiResponse = Kanji[];

const CJK_REGEX = /[一-鿿㐀-䶿]/;

function backendCardToKanji(card: BackendKanjiCard): Kanji {
  const markers: string[] = [];
  if (card.jlpt_level) markers.push(`JLPT ${card.jlpt_level}`);
  if (card.stroke_count != null) markers.push(`${card.stroke_count} черт`);

  return {
    kanji: card.character,
    definition: card.meanings.join(', '),
    radical: card.radicals[0] ?? '',
    radical_name: card.radicals[0] ?? '',
    onyomi: card.on_readings.join('、'),
    kunyomi: card.kun_readings.join('、'),
    markers,
    rwords: [],
    parts: [],
  };
}

export async function fetchKanji(value: string, language: 'jp' | 'cn' | null): Promise<KanjiResponse> {
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
