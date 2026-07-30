import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { type MasteryStatus, type SavedWord } from '@/shared/api/types';
import { useDictionaryFilters } from '../model/useDictionaryFilters';
import { DictionaryPanelView } from './DictionaryPanelView';

const word = (overrides: Partial<SavedWord>): SavedWord => ({
  id: crypto.randomUUID(),
  kanji_full: '勉強',
  hiragana_full: 'べんきょう',
  def_en: ['study'],
  markers: ['JLPT N4'],
  savedAt: '2026-06-01T00:00:00Z',
  status: 'new',
  suspended: false,
  ...overrides,
});

const jpWords: SavedWord[] = [
  word({ kanji_full: '勉強', hiragana_full: 'べんきょう', markers: ['JLPT N4'], status: 'new' }),
  word({ kanji_full: 'water', hiragana_full: 'みず', markers: ['JLPT N5'], status: 'learning' }),
  word({ kanji_full: '経済', hiragana_full: 'けいざい', markers: ['JLPT N2'], status: 'known' }),
  word({
    kanji_full: '難しい',
    hiragana_full: 'むずかしい',
    markers: ['JLPT N4'],
    suspended: true,
  }),
];

const cnWords: SavedWord[] = [
  word({ kanji_full: '学习', hiragana_full: 'xuéxí', markers: ['HSK 1'], status: 'learning' }),
  word({ kanji_full: '经济', hiragana_full: 'jīngjì', markers: ['HSK 4'], status: 'known' }),
];

const meta: Meta<typeof DictionaryPanelView> = {
  title: 'features/DictionaryPanelView',
  component: DictionaryPanelView,
  decorators: [
    (Story) => (
      <div style={{ width: 720, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    words: jpWords,
    totalCount: jpWords.length,
    levelFilter: null,
    statusFilter: null,
    hasJlpt: true,
    hasHsk: false,
    onToggleLevel: fn(),
    onToggleStatus: fn(),
    onDelete: fn(),
    onAdvanceStatus: fn(),
    onToggleSuspend: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DictionaryPanelView>;

export const JlptCollection: Story = {};

export const HskCollection: Story = {
  args: { words: cnWords, totalCount: cnWords.length, hasJlpt: false, hasHsk: true },
};

/** Both level scales offered when the collection spans languages. */
export const MixedCollection: Story = {
  args: {
    words: [...jpWords, ...cnWords],
    totalCount: jpWords.length + cnWords.length,
    hasJlpt: true,
    hasHsk: true,
  },
};

export const FilterActive: Story = {
  args: {
    words: jpWords.filter((entry) => entry.markers?.includes('JLPT N4')),
    totalCount: jpWords.length,
    levelFilter: 'N4',
  },
};

/** Nothing saved at all — distinct copy from "nothing matches". */
export const EmptyCollection: Story = {
  args: { words: [], totalCount: 0, hasJlpt: false, hasHsk: false },
};

/** Words exist but the active filter excludes all of them. */
export const NoFilterMatches: Story = {
  args: { words: [], totalCount: jpWords.length, statusFilter: 'known', levelFilter: 'N1' },
};

/** Interactive: exercises the real filter hook the container uses. */
const Filterable = () => {
  const [words] = useState(() => [...jpWords, ...cnWords]);
  const { filtered, levelFilter, statusFilter, toggleLevel, toggleStatus, hasJlpt, hasHsk } =
    useDictionaryFilters(words);

  return (
    <DictionaryPanelView
      words={filtered}
      totalCount={words.length}
      levelFilter={levelFilter}
      statusFilter={statusFilter}
      hasJlpt={hasJlpt}
      hasHsk={hasHsk}
      onToggleLevel={toggleLevel}
      onToggleStatus={(status: MasteryStatus) => toggleStatus(status)}
      onDelete={fn()}
      onAdvanceStatus={fn()}
      onToggleSuspend={fn()}
    />
  );
};

export const Interactive: Story = {
  render: () => <Filterable />,
};
