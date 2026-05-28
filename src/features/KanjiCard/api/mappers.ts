import { type BackendHanziCard, type BackendKanjiCard, type Kanji } from '@/shared/api/types';

export function backendCardToKanji(card: BackendKanjiCard): Kanji {
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

export function backendHanziCardToKanji(card: BackendHanziCard): Kanji {
  const markers: string[] = [];
  if (card.hsk_level != null) markers.push(`HSK ${card.hsk_level}`);

  return {
    kanji: card.character,
    definition: card.meanings.join(', '),
    pinyin: card.pinyin,
    markers,
    rwords: [],
    parts: [],
  };
}
