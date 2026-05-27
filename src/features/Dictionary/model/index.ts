import { createEffect, createStore } from 'effector';
import { MasteryStatus, SavedWord, Word } from '@/shared/api/types';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';

export const $savedWords = createStore<SavedWord[]>([]);

export const loadDictionaryFx = createEffect(async () => {
  if (!$isAuthenticated.getState()) return [];
  const res = await fetch('/api/dictionary');
  return res.json() as Promise<SavedWord[]>;
});

export const addWordFx = createEffect(async (word: Word) => {
  if (!$isAuthenticated.getState()) throw new Error('not_authenticated');
  const language = $userProfile.getState().selectedLanguage ?? 'jp';
  const res = await fetch('/api/dictionary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...word, language }),
  });
  if (res.status === 409) throw new Error('already_saved');
  return res.json() as Promise<SavedWord>;
});

export const removeWordFx = createEffect(async (id: string) => {
  if (!$isAuthenticated.getState()) throw new Error('not_authenticated');
  await fetch(`/api/dictionary/${id}`, { method: 'DELETE' });
  return id;
});

export const updateStatusFx = createEffect(
  async ({ id, status }: { id: string; status: MasteryStatus }) => {
    if (!$isAuthenticated.getState()) throw new Error('not_authenticated');
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
