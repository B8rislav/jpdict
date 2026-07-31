import { type EntryListItem } from 'designoslav';
import { type Word } from '@/shared/api/types';

/** Stable list identity for a search match. */
export const wordEntryId = (word: Word, index: number): string =>
  word.id ?? word.kanji_full ?? word.hiragana_full ?? `w${index}`;

/**
 * Map a dictionary match onto a row for the results column, so a word search reads with
 * the same rhythm as a sentence breakdown — one `EntryCard` per result, detail on the right.
 *
 * No part of speech is passed: the backend's `typeofspeech` is free text, not one of
 * Designoslav's four accent categories, so a row gets its localized label without a
 * colored accent rather than a wrong one.
 */
export const wordToEntry = (word: Word, index: number, showReading: boolean): EntryListItem => {
  const definitions = word.def_ru?.length ? word.def_ru : word.def_en;

  return {
    id: wordEntryId(word, index),
    headword: word.kanji_full ?? word.hiragana_full,
    // Only a headword in kanji has a reading to show above it; for a kana headword the
    // reading *is* the headword.
    reading: showReading && word.kanji_full ? word.hiragana_full : undefined,
    posLabel: word.typeofspeech,
    gloss: definitions?.join('; ') || '—',
  };
};
