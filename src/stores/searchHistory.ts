import { createEvent, createStore } from 'effector';

export const clearSearchHistory = createEvent();
export const $searchHistory = createStore<string[]>([]).on(
  clearSearchHistory,
  () => [],
);
