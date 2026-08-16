import { createEffect, createEvent, createStore, sample } from 'effector';
import {
  type CardType,
  type DeckSummary,
  type MasteryStatus,
  type SavedWord,
  type VocabularyPage,
  type Word,
} from '@/shared/api/types';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';
import { queryToRequestParams, type DictionaryQuery } from './query';

/** Rows fetched per request. The list is virtualized, so this is about network, not DOM. */
export const PAGE_SIZE = 50;

type PageRequest = { query: DictionaryQuery; offset: number };

/** The rows on screen. Appended to while scrolling, replaced when the filters change. */
export const $items = createStore<SavedWord[]>([]);
/** How many rows match the filters overall — the «Показано: N» denominator. */
export const $total = createStore(0);
export const $deckSummaries = createStore<DeckSummary[]>([]);

/** Fired when the view changes: a different deck, filter, or search text. */
export const queryChanged = createEvent<DictionaryQuery>();
/** Fired when the virtualized list nears its end. */
export const nextPageRequested = createEvent<DictionaryQuery>();

export const loadPageFx = createEffect(async ({ query, offset }: PageRequest) => {
  if (!$isAuthenticated.getState()) return { items: [], total: 0, offset };

  const language = $userProfile.getState().selectedLanguage ?? 'jp';
  const params = queryToRequestParams(query, language, offset, PAGE_SIZE);
  const res = await fetch(`/api/dictionary?${params.toString()}`);
  if (!res.ok) throw new Error('dictionary_load_failed');

  const page = (await res.json()) as VocabularyPage;
  return { ...page, offset };
});

export const fetchDeckSummariesFx = createEffect(async (): Promise<DeckSummary[]> => {
  const language = $userProfile.getState().selectedLanguage;
  if (!language || !$isAuthenticated.getState()) return [];

  const res = await fetch(`/api/review/stats?language=${language}`);
  if (!res.ok) return [];
  const stats = (await res.json()) as { decks?: DeckSummary[] };
  return stats.decks ?? [];
});

/**
 * Which of `expressions` this user has already saved. Batched per rendered view — it
 * replaces a store that held the whole collection just to answer the same question.
 */
export const fetchSavedFx = createEffect(
  async ({ expressions, cardType = 'word' }: { expressions: string[]; cardType?: CardType }) => {
    if (!expressions.length || !$isAuthenticated.getState()) return [];

    const language = $userProfile.getState().selectedLanguage ?? 'jp';
    const params = new URLSearchParams({ language, card_type: cardType });
    for (const expression of expressions) params.append('expression', expression);

    const res = await fetch(`/api/dictionary/saved?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { saved: string[] };
    return data.saved ?? [];
  },
);

export const addWordFx = createEffect(
  async (word: Word & { cardType?: CardType; strokeCount?: number }) => {
    if (!$isAuthenticated.getState()) throw new Error('not_authenticated');
    const language = $userProfile.getState().selectedLanguage ?? 'jp';
    const res = await fetch('/api/dictionary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...word, language }),
    });
    if (res.status === 409) throw new Error('already_saved');
    return res.json() as Promise<SavedWord>;
  },
);

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

export const toggleSuspendFx = createEffect(
  async ({ id, suspend }: { id: string; suspend: boolean }) => {
    if (!$isAuthenticated.getState()) throw new Error('not_authenticated');
    const res = await fetch(`/api/review/${id}/${suspend ? 'suspend' : 'unsuspend'}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('suspend_failed');
    return { id, suspended: suspend };
  },
);

$items
  // offset 0 means a fresh view (filters changed); anything else continues the current one.
  .on(loadPageFx.doneData, (items, page) =>
    page.offset === 0 ? page.items : [...items, ...page.items],
  )
  .on(removeWordFx.doneData, (items, id) => items.filter((word) => word.id !== id))
  .on(updateStatusFx.doneData, (items, updated) =>
    items.map((word) => (word.id === updated.id ? updated : word)),
  )
  .on(toggleSuspendFx.doneData, (items, { id, suspended }) =>
    items.map((word) => (word.id === id ? { ...word, suspended } : word)),
  );

$total
  .on(loadPageFx.doneData, (_, page) => page.total)
  // A deleted row leaves the match set too; refetching the page just for that would be silly.
  .on(removeWordFx.doneData, (total) => Math.max(0, total - 1));

$deckSummaries.on(fetchDeckSummariesFx.doneData, (_, decks) => decks);

/**
 * Expressions saved during this session. Lets a "saved ✓" affordance flip immediately
 * without re-asking the backend, now that no store holds the whole collection.
 */
export const $sessionSaved = createStore<string[]>([]).on(
  addWordFx.doneData,
  (saved, word) => [...saved, word.kanji_full ?? word.hiragana_full ?? ''],
);

/** A changed view always restarts at the first page. */
sample({
  clock: queryChanged,
  fn: (query: DictionaryQuery): PageRequest => ({ query, offset: 0 }),
  target: loadPageFx,
});

/**
 * Load the next page from however many rows are already held. Skipped while a request
 * is in flight or everything is loaded, so a scroll that re-triggers is harmless.
 */
sample({
  clock: nextPageRequested,
  source: { items: $items, total: $total, pending: loadPageFx.pending },
  filter: ({ items, total, pending }) => !pending && items.length < total,
  fn: ({ items }, query: DictionaryQuery): PageRequest => ({ query, offset: items.length }),
  target: loadPageFx,
});

/** Saving, deleting or restatusing a card moves the deck counts. */
sample({
  clock: [addWordFx.done, removeWordFx.done, updateStatusFx.done],
  target: fetchDeckSummariesFx,
});
