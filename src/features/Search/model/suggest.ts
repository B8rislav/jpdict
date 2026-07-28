import { createEffect, createEvent, createStore } from 'effector';

import type { Language, SuggestOption } from '@/shared/api/types';
import { getLocale } from '@/shared/i18n';
import { logEffectFailures } from '@/shared/utils/logEffectFailures';

/** Parse options («варианты разбора») for the current query. */
export const $suggestions = createStore<SuggestOption[]>([]);

export const clearSuggestions = createEvent();

export const fetchSuggestFx = createEffect(
  async ({ query, language }: { query: string; language: Language }): Promise<SuggestOption[]> => {
    const response = await fetch(
      `/api/search/suggest?q=${encodeURIComponent(query)}&lang=${language}&def_lang=${getLocale()}`,
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { options?: SuggestOption[] };
    return data.options ?? [];
  },
);

logEffectFailures(fetchSuggestFx, 'search-suggest');

$suggestions.on(fetchSuggestFx.doneData, (_, options) => options).reset(clearSuggestions);
