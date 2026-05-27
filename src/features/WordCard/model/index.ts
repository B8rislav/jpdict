import { createEffect, createEvent, createStore } from 'effector';
import { logEffectFailures } from '@/shared/utils/logEffectFailures';
import { fetchWords, type WordsResponse } from '../api/fetchWords';
import { type Word } from '@/shared/api/types';

export const clearWords = createEvent();
export const $words = createStore<Word[]>([]);

type FetchWordsFX = (params: {
  value: string;
  language: 'jp' | 'cn' | null;
}) => Promise<WordsResponse | undefined>;
export const fetchWordsFx = createEffect<FetchWordsFX>(async ({ value, language }) => {
  return await fetchWords(value, language);
});

logEffectFailures(fetchWordsFx, 'words');

$words.on(clearWords, () => []);

$words.on(fetchWordsFx.doneData, (_, data) => data?.words ?? []);
