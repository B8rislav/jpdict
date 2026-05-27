import { createEffect, createEvent, createStore } from 'effector';
import { logEffectFailures } from '@/shared/utils/logEffectFailures';
import { fetchSentence, type SentenceResponse } from '../api/fetchSentence';

export type SentenceResult = SentenceResponse;

export const clearSentences = createEvent();
export const $sentences = createStore<SentenceResult[]>([]);

type FetchSentenceFX = (params: {
  value: string;
  language: 'jp' | 'cn';
}) => Promise<SentenceResponse | undefined>;
export const fetchSentenceFx = createEffect<FetchSentenceFX>(async ({ value, language }) => {
  return await fetchSentence(value, language);
});

logEffectFailures(fetchSentenceFx, 'sentence');

$sentences.on(clearSentences, () => []);

$sentences.on(fetchSentenceFx.doneData, (_, data) => {
  if (!data) {
    return [];
  }
  return [data];
});
