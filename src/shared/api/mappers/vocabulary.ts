import { type MasteryStatus, type SavedWord, type Word } from '../types';
import { levelMarkers, parseLevelMarkers } from './levels';

/** A vocabulary row as FastAPI serialises it. */
export interface BackendWord {
  id: string;
  expression: string;
  reading: string;
  meaning: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  status: MasteryStatus;
  added_at: string;
  suspended?: boolean;
}

export function toSavedWord(word: BackendWord): SavedWord {
  return {
    id: word.id,
    kanji_full: word.expression,
    hiragana_full: word.reading,
    def_en: [word.meaning],
    markers: levelMarkers(word.jlpt_level, word.hsk_level),
    savedAt: word.added_at,
    status: word.status,
    suspended: word.suspended ?? false,
  };
}

/** A word the user chose to save → the backend's create payload. */
export function toVocabularyPayload(word: Word & { language?: string }): Record<string, unknown> {
  const meaning = word.def_en?.[0] ?? word.def_ru?.[0] ?? '';
  return {
    language: word.language ?? 'jp',
    expression: word.kanji_full ?? word.hiragana_full ?? '',
    reading: word.hiragana_full ?? '',
    meaning: String(meaning),
    ...parseLevelMarkers(word.markers),
    status: 'new',
  };
}
