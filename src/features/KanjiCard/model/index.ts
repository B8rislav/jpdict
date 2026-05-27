import { createEffect, createEvent, createStore } from 'effector';
import { logEffectFailures } from '@/shared/utils/logEffectFailures';
import { fetchKanji, type KanjiResponse } from '../api/fetchKanji';
import { type Kanji } from '@/shared/api/types';

export const clearKanji = createEvent();
export const $kanji = createStore<Kanji[]>([]);

type FetchKanjiFX = (params: {
  value: string;
  language: 'jp' | 'cn' | null;
}) => Promise<KanjiResponse | undefined>;
export const fetchKanjiFx = createEffect<FetchKanjiFX>(async ({ value, language }) => {
  return await fetchKanji(value, language);
});

logEffectFailures(fetchKanjiFx, 'kanji');

$kanji.on(clearKanji, () => []);

$kanji.on(fetchKanjiFx.doneData, (_, data) => data ?? []);
