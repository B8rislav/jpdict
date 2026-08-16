import { type Kanji, type Word } from '@/shared/api/types';

/** Matches the stroke-count marker in either locale's wording («11 черт» / «11 strokes»). */
const STROKE_MARKER = /(\d+)\s*(черт|stroke)/i;

/**
 * A kanji lookup result → the payload that saves it as a kanji card.
 *
 * Shared by the two places a kanji can be added (the search result and a word's
 * constituent characters) so both store the same fields; the stroke count in particular
 * is only ever available from the lookup the user is already looking at.
 */
export function kanjiToPayload(kanji: Kanji): Word & { cardType: 'kanji'; strokeCount?: number } {
  const strokes = kanji.markers.map((marker) => marker.match(STROKE_MARKER)).find(Boolean);

  return {
    cardType: 'kanji',
    kanji_full: kanji.kanji,
    // On'yomi is the conventional headword reading for a standalone kanji card.
    hiragana_full: kanji.onyomi ?? kanji.kunyomi ?? kanji.pinyin ?? '',
    def_ru: kanji.definition ? [kanji.definition] : [],
    markers: kanji.markers.filter((marker) => !STROKE_MARKER.test(marker)),
    strokeCount: strokes ? Number(strokes[1]) : undefined,
  };
}
