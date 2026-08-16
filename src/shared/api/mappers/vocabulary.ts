import {
  type CardType,
  type MasteryStatus,
  type SavedWord,
  type VocabularyPage,
  type Word,
} from '../types';
import { levelMarkers, parseLevelMarkers } from './levels';

/** A vocabulary row as FastAPI serialises it. */
export interface BackendWord {
  id: string;
  card_type: CardType;
  expression: string;
  reading: string;
  meaning: string;
  meaning_ru: string | null;
  jlpt_level: number | null;
  hsk_level: number | null;
  stroke_count: number | null;
  status: MasteryStatus;
  added_at: string;
  suspended?: boolean;
}

/** `GET /api/vocabulary` — one page plus the count of everything matching the filters. */
export interface BackendVocabularyPage {
  items: BackendWord[];
  total: number;
}

export function toSavedWord(word: BackendWord): SavedWord {
  return {
    id: word.id,
    cardType: word.card_type ?? 'word',
    kanji_full: word.expression,
    hiragana_full: word.reading,
    // The two glosses stay apart so a row can render «есть · to eat». Before the
    // backend had meaning_ru, one language was discarded at save time.
    def_en: word.meaning ? [word.meaning] : [],
    def_ru: word.meaning_ru ? [word.meaning_ru] : [],
    markers: levelMarkers(word.jlpt_level, word.hsk_level),
    strokeCount: word.stroke_count ?? undefined,
    savedAt: word.added_at,
    status: word.status,
    suspended: word.suspended ?? false,
  };
}

export function toVocabularyPage(page: BackendVocabularyPage): VocabularyPage {
  return { items: (page.items ?? []).map(toSavedWord), total: page.total ?? 0 };
}

/** A word or kanji the user chose to save → the backend's create payload. */
export function toVocabularyPayload(
  word: Word & { language?: string; cardType?: CardType; strokeCount?: number },
): Record<string, unknown> {
  return {
    language: word.language ?? 'jp',
    card_type: word.cardType ?? 'word',
    expression: word.kanji_full ?? word.hiragana_full ?? '',
    reading: word.hiragana_full ?? '',
    // Each language goes in its own field rather than collapsing to whichever
    // one happened to be present.
    meaning: String(word.def_en?.[0] ?? word.def_ru?.[0] ?? ''),
    meaning_ru: word.def_ru?.[0] ?? null,
    ...parseLevelMarkers(word.markers),
    stroke_count: word.strokeCount ?? null,
    status: 'new',
  };
}
