import { describe, it, expect, beforeAll } from 'vitest';

import { setLocale } from '@/shared/i18n';
import type { SuggestOption } from '@/shared/api/types';

import { historyToItem, suggestionToItem } from './optionMapping';

const option = (overrides: Partial<SuggestOption>): SuggestOption => ({
  id: 'x',
  kind: 'word',
  unit: 'word',
  query_type: 'word',
  text: '勉強',
  ...overrides,
});

describe('suggestionToItem', () => {
  beforeAll(() => setLocale('ru'));

  it('passes through id / unit / text', () => {
    const item = suggestionToItem(option({ id: 'word-勉強', text: '勉強' }));
    expect(item.id).toBe('word-勉強');
    expect(item.unit).toBe('word');
    expect(item.text).toBe('勉強');
  });

  it('word hint is the generic "parse as word" copy', () => {
    expect(suggestionToItem(option({ kind: 'word' })).hint).toBe('разобрать как слово');
  });

  it('verb hint appends the "verb" label to the gloss', () => {
    const item = suggestionToItem(option({ kind: 'verb', text: '勉強する', gloss: 'учиться' }));
    expect(item.hint).toBe('учиться · глагол');
  });

  it('kanji hint joins gloss and level', () => {
    const item = suggestionToItem(
      option({ kind: 'kanji', unit: 'kanji', text: '勉', gloss: 'усердие', level: 'N3' }),
    );
    expect(item.hint).toBe('усердие · N3');
  });

  it('kanji hint omits the missing level', () => {
    const item = suggestionToItem(option({ kind: 'kanji', unit: 'kanji', gloss: 'усердие' }));
    expect(item.hint).toBe('усердие');
  });

  it('phrase hint is the "full sentence parse" copy', () => {
    const item = suggestionToItem(option({ kind: 'phrase', unit: 'phrase' }));
    expect(item.hint).toBe('полный разбор предложения');
  });

  it('reverse hint prefixes the preview gloss', () => {
    const item = suggestionToItem(
      option({ kind: 'reverse_word', text: 'study', gloss: '勉強 · べんきょう' }),
    );
    expect(item.hint).toBe('поиск по значению: 勉強 · べんきょう');
  });

  it('reverse hint without a preview is the bare "by meaning" copy', () => {
    const item = suggestionToItem(option({ kind: 'reverse_word', text: 'study' }));
    expect(item.hint).toBe('поиск по значению');
  });
});

describe('historyToItem', () => {
  beforeAll(() => setLocale('ru'));

  it('maps query_type to the badge unit', () => {
    expect(historyToItem({ id: '1', query: '勉', query_type: 'kanji' }).unit).toBe('kanji');
    expect(historyToItem({ id: '2', query: '私は', query_type: 'sentence' }).unit).toBe('phrase');
    expect(historyToItem({ id: '3', query: '勉強', query_type: 'word' }).unit).toBe('word');
  });

  it('defaults to the word unit when query_type is absent', () => {
    expect(historyToItem({ id: '4', query: '猫' }).unit).toBe('word');
  });

  it('uses the query as the visible text', () => {
    expect(historyToItem({ id: '5', query: '食べる', query_type: 'word' }).text).toBe('食べる');
  });
});
