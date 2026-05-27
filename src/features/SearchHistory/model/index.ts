import { createEffect, createStore } from 'effector';

export interface HistoryItem {
  id: string;
  query: string;
}

export const $searchHistory = createStore<HistoryItem[]>([]);

export const loadHistoryFx = createEffect(async (language: 'jp' | 'cn') => {
  const res = await fetch(`/api/history?lang=${language}&limit=20`);
  if (!res.ok) return [];
  return (await res.json()) as HistoryItem[];
});

export const addHistoryFx = createEffect(
  async ({
    language,
    query,
    query_type,
  }: {
    language: string;
    query: string;
    query_type: string;
  }) => {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, query, query_type }),
    });
    if (!res.ok) return null;
    return (await res.json()) as HistoryItem;
  },
);

export const removeHistoryFx = createEffect(async (id: string) => {
  await fetch(`/api/history/${id}`, { method: 'DELETE' });
  return id;
});

export const clearHistoryFx = createEffect(async () => {
  await fetch('/api/history', { method: 'DELETE' });
});

$searchHistory
  .on(loadHistoryFx.doneData, (_, items) => items)
  .on(addHistoryFx.doneData, (items, newItem) => {
    if (!newItem) return items;
    const deduped = items.filter((item) => item.query !== newItem.query);
    return [newItem, ...deduped].slice(0, 20);
  })
  .on(removeHistoryFx, (items, id) => items.filter((item) => item.id !== id))
  .on(clearHistoryFx, () => []);
