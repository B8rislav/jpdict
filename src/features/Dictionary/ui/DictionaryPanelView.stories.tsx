import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { type MasteryStatus, type SavedWord } from '@/shared/api/types';
import { DictionaryPanelView } from './DictionaryPanelView';

const word = (
  kanji: string,
  reading: string,
  ru: string,
  en: string,
  level: string,
  status: MasteryStatus,
): SavedWord => ({
  id: `${kanji}-${status}`,
  cardType: 'word',
  kanji_full: kanji,
  hiragana_full: reading,
  def_ru: [ru],
  def_en: [en],
  markers: [level],
  savedAt: '2026-06-01T00:00:00Z',
  status,
  suspended: false,
});

const words: SavedWord[] = [
  word('食べる', 'たべる', 'есть', 'to eat', 'JLPT N5', 'new'),
  word('図書館', 'としょかん', 'библиотека', 'library', 'JLPT N4', 'learning'),
  word('経済', 'けいざい', 'экономика', 'economy', 'JLPT N3', 'known'),
  word('難しい', 'むずかしい', 'трудный', 'difficult', 'JLPT N4', 'new'),
  word('約束', 'やくそく', 'обещание', 'promise', 'JLPT N3', 'learning'),
];

const kanji: SavedWord[] = [
  { ...word('私', 'シ', 'я, частный, личный', 'private', 'JLPT N5', 'known'), cardType: 'kanji', strokeCount: 7 },
  { ...word('毎', 'マイ', 'каждый, всякий', 'every', 'JLPT N5', 'learning'), cardType: 'kanji', strokeCount: 6 },
  { ...word('語', 'ゴ', 'язык; слово', 'language', 'JLPT N5', 'new'), cardType: 'kanji', strokeCount: 14 },
];

const meta: Meta<typeof DictionaryPanelView> = {
  title: 'features/DictionaryPanelView',
  component: DictionaryPanelView,
  args: {
    deck: 'word',
    items: words,
    total: words.length,
    loading: false,
    emptyCollection: false,
    canSpeak: true,
    onSpeak: fn(),
    onDelete: fn(),
    onAdvanceStatus: fn(),
    onEndReached: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DictionaryPanelView>;

/** The word deck: gloss shows both languages, status pill advances on click. */
export const WordDeck: Story = {};

/** The kanji deck renders a tile grid instead of rows. */
export const KanjiDeck: Story = {
  args: { deck: 'kanji', items: kanji, total: kanji.length },
};

/** No voice for the study language — ▶ is disabled rather than silently doing nothing. */
export const WithoutSpeech: Story = {
  args: { canSpeak: false },
};

/** Nothing saved yet — distinct from filters matching nothing. */
export const EmptyCollection: Story = {
  args: { items: [], total: 0, emptyCollection: true },
};

/** Filters exclude everything; the copy tells the user it's the filters, not the collection. */
export const NoFilterMatches: Story = {
  args: { items: [], total: 0, emptyCollection: false },
};

/** Another page is in flight, shown as a trailing row inside the list. */
export const LoadingMore: Story = {
  args: { loading: true, total: 40 },
};
