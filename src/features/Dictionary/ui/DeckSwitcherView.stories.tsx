import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { type DeckSummary } from '@/shared/api/types';
import { DeckSwitcherView } from './DeckSwitcherView';

const decks: DeckSummary[] = [
  { cardType: 'kanji', total: 7, due: 3, newToday: 2, doneToday: 2 },
  { cardType: 'word', total: 8, due: 3, newToday: 3, doneToday: 0 },
];

const meta: Meta<typeof DeckSwitcherView> = {
  title: 'features/DeckSwitcherView',
  component: DeckSwitcherView,
  args: {
    decks,
    openDeck: 'kanji',
    onOpenDeck: fn(),
    onStudy: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DeckSwitcherView>;

/** The kanji deck open, part-way through today's session. */
export const KanjiOpen: Story = {};

export const WordsOpen: Story = {
  args: { openDeck: 'word' },
};

/**
 * Before the stats arrive there are no summaries at all — both cards still render,
 * at zero, rather than the page collapsing to one deck.
 */
export const NoSummariesYet: Story = {
  args: { decks: [] },
};

/** A user who has finished everything scheduled for today. */
export const AllDone: Story = {
  args: {
    decks: [
      { cardType: 'kanji', total: 7, due: 0, newToday: 0, doneToday: 5 },
      { cardType: 'word', total: 8, due: 0, newToday: 0, doneToday: 6 },
    ],
  },
};
