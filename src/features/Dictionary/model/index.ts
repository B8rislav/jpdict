import { createEffect, createStore } from 'effector';
import { MasteryStatus, SavedWord, WordEntry } from '@/shared/api/types';

export const $savedWords = createStore<SavedWord[]>([]);

export const loadDictionaryFx = createEffect(async () => {
  const res = await fetch('/api/dictionary');
  return res.json() as Promise<SavedWord[]>;
});

export const addWordFx = createEffect(async (word: WordEntry) => {
  const res = await fetch('/api/dictionary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(word),
  });
  if (res.status === 409) throw new Error('already_saved');
  return res.json() as Promise<SavedWord>;
});

export const removeWordFx = createEffect(async (id: string) => {
  await fetch(`/api/dictionary/${id}`, { method: 'DELETE' });
  return id;
});

export const updateStatusFx = createEffect(
  async ({ id, status }: { id: string; status: MasteryStatus }) => {
    const res = await fetch(`/api/dictionary/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json() as Promise<SavedWord>;
  },
);

$savedWords
  .on(loadDictionaryFx.doneData, (_, words) => words)
  .on(addWordFx.doneData, (words, word) => [...words, word])
  .on(removeWordFx.doneData, (words, id) => words.filter((w) => w.id !== id))
  .on(updateStatusFx.doneData, (words, updated) =>
    words.map((w) => (w.id === updated.id ? updated : w)),
  );
