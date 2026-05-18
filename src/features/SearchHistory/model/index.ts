import { createEvent, createStore } from 'effector';

const MAX_HISTORY = 20;
const STORAGE_KEY = 'searchHistory';

export const addToHistory = createEvent<string>();
export const removeFromHistory = createEvent<string>();
export const clearSearchHistory = createEvent();
export const loadSearchHistory = createEvent<void>();

export const $searchHistory = createStore<string[]>([])
  .on(addToHistory, (history, query) => {
    const deduped = history.filter((h) => h !== query);
    return [query, ...deduped].slice(0, MAX_HISTORY);
  })
  .on(removeFromHistory, (history, query) => history.filter((h) => h !== query))
  .on(clearSearchHistory, () => [])
  .on(loadSearchHistory, () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

$searchHistory.updates.watch((history) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
});
