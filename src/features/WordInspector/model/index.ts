import { createEffect, createEvent, createStore, sample } from 'effector';
import { type Kanji, type Word } from '@/shared/api/types';
import { fetchWordsFx } from '../../WordCard/model';
import { fetchKanji } from '@/features/KanjiCard/api/fetchKanji';
import { fetchExampleSentences, type ReibunEntry } from '../api/fetchExampleSentences';
import { $userProfile } from '@/stores/userProfile';

export const clearInspectedWord = createEvent();

/**
 * Inspect a word the user picked from an already-loaded result list, without refetching.
 * A word search returns a page of matches; the first is inspected automatically, and this
 * is how the rest become reachable.
 */
export const inspectWord = createEvent<Word>();

export const $inspectedWord = createStore<Word | null>(null)
  .on(clearInspectedWord, () => null)
  .on(inspectWord, (_, word) => word);

sample({
  clock: fetchWordsFx.doneData,
  fn: (data) => data?.words?.[0] ?? null,
  target: $inspectedWord,
});

export const fetchInspectorKanjiFx = createEffect(
  async ({ value, language }: { value: string; language: 'jp' | 'cn' | null }) =>
    fetchKanji(value, language, $userProfile.getState().uiLocale),
);

export const $inspectorKanji = createStore<Kanji[]>([])
  .on(fetchInspectorKanjiFx.doneData, (_, data) => data ?? [])
  // Switching words must drop the old characters too, or the new headword briefly
  // shows the previous word's kanji.
  .reset(clearInspectedWord, inspectWord);

// A fresh word invalidates the previous word's kanji until the new fetch lands.
sample({
  clock: fetchWordsFx.doneData,
  fn: () => [] as Kanji[],
  target: $inspectorKanji,
});

export const fetchExampleSentencesFx = createEffect(async (wordId: string) => {
  return await fetchExampleSentences(wordId, $userProfile.getState().uiLocale);
});

export const $exampleSentences = createStore<ReibunEntry[]>([])
  .on(fetchExampleSentencesFx.doneData, (_, data) => data?.reibuns ?? [])
  .reset(clearInspectedWord, inspectWord);

sample({
  clock: fetchWordsFx.doneData,
  fn: () => [] as ReibunEntry[],
  target: $exampleSentences,
});
