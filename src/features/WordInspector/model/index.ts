import { createEffect, createEvent, createStore, sample } from 'effector';
import { fetchWordsFx, Word } from '../../WordCard/model';
import { fetchExampleSentences, SimpleSentence } from '../api/fetchExampleSentences';

export const clearInspectedWord = createEvent();

export const $inspectedWord = createStore<Word | null>(null).on(
  clearInspectedWord,
  () => null,
);

sample({
  clock: fetchWordsFx.doneData,
  fn: (data) => data?.words?.[0] ?? null,
  target: $inspectedWord,
});

export const fetchExampleSentencesFx = createEffect(async (wordId: string) => {
  return await fetchExampleSentences(wordId);
});

export const $exampleSentences = createStore<SimpleSentence[]>([])
  .on(fetchExampleSentencesFx.doneData, (_, data) => data?.reibuns ?? [])
  .on(clearInspectedWord, () => []);

sample({
  clock: fetchWordsFx.doneData,
  fn: () => [] as SimpleSentence[],
  target: $exampleSentences,
});

export const addWordFx = createEffect(async (word: Word) => {
  console.log('addWordFx: Phase 8 not yet implemented', word);
});
