import { components } from '@/shared/api/generatedTypes';
import { createEffect, createEvent, createStore } from 'effector';
import { fetchKanji, KanjiResponse } from '../api/fetchKanji';

export type Kanji = Pick<
  components['schemas']['Kanji'],
  | 'kanji'
  | 'definition'
  | 'radical'
  | 'radical_name'
  | 'rwords'
  | 'kunyomi'
  | 'onyomi'
  | 'parts'
> & {
  markers: string[];
};

export const clearKanji = createEvent();
export const $kanji = createStore<Kanji[]>([]);

type FetchKanjiFX = (value: string) => Promise<KanjiResponse | undefined>;
export const fetchKanjiFx = createEffect<FetchKanjiFX>(async (value) => {
  return await fetchKanji(value);
});

fetchKanjiFx.fail.watch(({ params, error }) =>
  console.error(`Failed to fetch ${params}:`, error),
);

$kanji.on(clearKanji, () => []);

$kanji.on(fetchKanjiFx.doneData, (_, data) => {
  return data?.map((responseKanji) => {
    const kanji: Kanji = { ...responseKanji, markers: [] };

    if (responseKanji.kanken) {
      kanji.markers.push(`Kanken: ${responseKanji.kanken}`);
    }
    if (responseKanji.jlpt) {
      kanji.markers.push(`JLPT: ${responseKanji.jlpt}`);
    }
    return kanji;
  });
});
