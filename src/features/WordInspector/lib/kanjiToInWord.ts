import { type KanjiInWord } from 'designoslav';

import { type Kanji } from '@/shared/api/types';
import { type Translate } from '@/shared/i18n';

/** Matches the JLPT/HSK level chip among a kanji's markers. */
const LEVEL_MARKER = /^(JLPT|HSK)/;
/** Matches the stroke-count chip, in either locale's wording. */
const STROKE_MARKER = /черт|stroke/i;

/**
 * A kanji lookup result → the shape the design-system word card consumes.
 *
 * Pure, with `t` passed in, so it's unit-testable and usable from either side
 * of the container/view split.
 */
export function kanjiToInWord(kanji: Kanji, t: Translate): KanjiInWord {
  const readings = [kanji.onyomi, kanji.kunyomi].filter(Boolean).join('・');

  return {
    id: kanji.kanji ?? '',
    kanji: kanji.kanji ?? '',
    meaning: kanji.definition ?? '',
    readings: readings || undefined,
    jlpt: kanji.markers.find((marker) => LEVEL_MARKER.test(marker)),
    strokeCount: kanji.markers.find((marker) => STROKE_MARKER.test(marker)),
    onyomi: kanji.onyomi ? { label: t('ui', 'kanji_onyomi'), readings: kanji.onyomi } : undefined,
    kunyomi: kanji.kunyomi
      ? { label: t('ui', 'kanji_kunyomi'), readings: kanji.kunyomi }
      : undefined,
    radical: kanji.radical ? { char: kanji.radical, gloss: kanji.radical_name } : undefined,
    radicalLabel: t('ui', 'kanji_radical'),
    parts: kanji.parts
      ?.filter((part) => part.piece)
      .map((part) => ({ char: part.piece, gloss: part.definition })),
    partsLabel: t('ui', 'kanji_parts'),
    strokeOrderLabel: t('ui', 'kanji_stroke_order'),
  };
}
