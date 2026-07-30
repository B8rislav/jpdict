import { createEffect, createEvent, createStore, sample } from 'effector';
import { type Kanji, type Word } from '@/shared/api/types';
import { fetchWordsFx } from '../../WordCard/model';
import { fetchKanji } from '@/features/KanjiCard/api/fetchKanji';
import { fetchExampleSentences, type ReibunEntry } from '../api/fetchExampleSentences';
import { $userProfile } from '@/stores/userProfile';

export const clearInspectedWord = createEvent();

export const $inspectedWord = createStore<Word | null>(null).on(clearInspectedWord, () => null);

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
  .reset(clearInspectedWord);

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
  .on(clearInspectedWord, () => []);

sample({
  clock: fetchWordsFx.doneData,
  fn: () => [] as ReibunEntry[],
  target: $exampleSentences,
});
