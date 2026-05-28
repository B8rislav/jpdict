import { createEffect, createEvent, createStore, sample } from 'effector';
import { type Word } from '@/shared/api/types';
import { fetchWordsFx } from '../../WordCard/model';
import { fetchExampleSentences, type ReibunEntry } from '../api/fetchExampleSentences';

export const clearInspectedWord = createEvent();

export const $inspectedWord = createStore<Word | null>(null).on(clearInspectedWord, () => null);

sample({
  clock: fetchWordsFx.doneData,
  fn: (data) => data?.words?.[0] ?? null,
  target: $inspectedWord,
});

export const fetchExampleSentencesFx = createEffect(async (wordId: string) => {
  return await fetchExampleSentences(wordId);
});

export const $exampleSentences = createStore<ReibunEntry[]>([])
  .on(fetchExampleSentencesFx.doneData, (_, data) => data?.reibuns ?? [])
  .on(clearInspectedWord, () => []);

sample({
  clock: fetchWordsFx.doneData,
  fn: () => [] as ReibunEntry[],
  target: $exampleSentences,
});
