import { createEffect, createEvent, createStore } from 'effector';
import { fetchSentence, SentenceResponse } from '../api/fetchSentence';

export type SentenceToken = {
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading?: string;
  pronunciation?: string;
};

export type SentenceResult = SentenceResponse;

export const clearSentences = createEvent();
export const $sentences = createStore<SentenceResult[]>([]);

type FetchSentenceFX = (params: { value: string; language: 'jp' | 'cn' | null }) => Promise<SentenceResponse | undefined>;
export const fetchSentenceFx = createEffect<FetchSentenceFX>(async ({ value, language }) => {
  return await fetchSentence(value, language);
});

fetchSentenceFx.fail.watch(({ params, error }) =>
  console.error(`Failed to fetch sentence ${params}:`, error),
);

$sentences.on(clearSentences, () => []);

$sentences.on(fetchSentenceFx.doneData, (_, data) => {
  if (!data) {
    return [];
  }
  return [data];
});
