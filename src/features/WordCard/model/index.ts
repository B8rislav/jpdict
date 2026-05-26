import { createEffect, createEvent, createStore } from 'effector';
import { fetchWords, WordsResponse } from '../api/fetchWords';

export type Word = {
  id?: string;
  kanji_full?: string;
  hiragana_full?: string;
  markers?: string[];
  pitch?: string[];
  def_en?: string[];
  def_ru?: string[];
  typeofspeech?: string;
};

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

$words.on(fetchWordsFx.doneData, (_, data) => data?.words ?? []);
