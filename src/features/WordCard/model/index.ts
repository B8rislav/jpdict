import { components } from '@/shared/api/generatedTypes';
import { createEffect, createEvent, createStore } from 'effector';
import { fetchWords, WordsResponse } from '../api/fetchWords';

export type Word = Pick<
  components['schemas']['Word'],
  'id' | 'kanji_full' | 'pitch' | 'hiragana_full' | 'markers' | 'def' | 'typeofspeech'
>;

export const clearWords = createEvent();
export const $words = createStore<Word[]>([]);

type FetchWordsFX = (params: { value: string; language: 'jp' | 'cn' | null }) => Promise<WordsResponse | undefined>;
export const fetchWordsFx = createEffect<FetchWordsFX>(async ({ value, language }) => {
  return await fetchWords(value, language);
});

fetchWordsFx.fail.watch(({ params, error }) =>
  console.error(`Failed to fetch ${params}:`, error),
);

$words.on(clearWords, () => []);

$words.on(fetchWordsFx.doneData, (_, data) => {
  return data?.words?.map((word) => {
    if (typeof word.def == 'string') {
      word.def = [word.def];
    }
    return word;
  });
});
