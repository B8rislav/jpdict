import { createEffect, createEvent, createStore } from 'effector';
import { fetchKanji, KanjiResponse } from '../api/fetchKanji';

export type Kanji = {
  kanji?: string;
  definition?: string;
  radical?: string;
  radical_name?: string;
  rwords?: { reading?: string; words?: unknown[] }[];
  kunyomi?: string;
  onyomi?: string;
  parts?: { piece?: string; definition?: string }[];
  markers: string[];
};

export const clearKanji = createEvent();
export const $kanji = createStore<Kanji[]>([]);

type FetchKanjiFX = (params: { value: string; language: 'jp' | 'cn' | null }) => Promise<KanjiResponse | undefined>;
export const fetchKanjiFx = createEffect<FetchKanjiFX>(async ({ value, language }) => {
  return await fetchKanji(value, language);
});

fetchKanjiFx.fail.watch(({ params, error }) =>
  console.error(`Failed to fetch ${params}:`, error),
);

$kanji.on(clearKanji, () => []);

$kanji.on(fetchKanjiFx.doneData, (_, data) => data ?? []);
