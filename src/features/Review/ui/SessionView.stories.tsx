import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { type ReviewCard as ReviewCardData } from '../api/types';
import { SessionView } from './SessionView';

const meta: Meta<typeof SessionView> = {
  title: 'features/Review/SessionView',
  component: SessionView,
  decorators: [
    (Story) => (
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SessionView>;

const WORD: ReviewCardData = {
  id: '1',
  language: 'jp',
  cardType: 'word',
  components: [],
  kanji_full: '食べる',
  hiragana_full: 'たべる',
  def_en: ['to eat'],
  markers: ['JLPT N5'],
  status: 'learning',
  dueAt: '2026-06-10T00:00:00Z',
  intervalDays: 6,
  easeFactor: 2.5,
  repetitions: 2,
  lapses: 0,
  lastReviewedAt: '2026-06-04T00:00:00Z',
  suspended: false,
  projectedIntervals: { again: 60, hard: 604800, good: 1296000, easy: 1728000 },
};

const KANJI: ReviewCardData = {
  ...WORD,
  id: 'k1',
  cardType: 'kanji',
  kanji_full: '毎',
  hiragana_full: 'マイ',
  def_en: ['каждый, всякий'],
  components: [{ character: '母', readings: ['なかれ'], meanings: ['мать'] }],
};

const handlers = { onGrade: fn(), onExit: fn(), onFinish: fn() };

/** Mid-session on a word card — the badge names the deck this card came from. */
export const WordCard: Story = {
  args: { card: WORD, total: 5, remaining: 4, readingLabel: 'Хирагана', ...handlers },
};

/** A kanji card in a deck-scoped session. */
export const KanjiCard: Story = {
  args: {
    card: KANJI,
    total: 5,
    remaining: 4,
    deck: 'kanji',
    readingLabel: 'Оньёми',
    ...handlers,
  },
};

/** The last card — the bar is nearly full and the counter reads 5 / 5. */
export const LastCard: Story = {
  args: { card: KANJI, total: 5, remaining: 1, deck: 'kanji', readingLabel: 'Оньёми', ...handlers },
};

/**
 * The queue is drained. One way onward, deliberately — "study again" would re-drill
 * cards the scheduler has already retired for today, which teaches the schedule
 * nothing while feeling productive.
 */
export const DeckComplete: Story = {
  args: { card: null, total: 5, remaining: 0, deck: 'kanji', readingLabel: 'Оньёми', ...handlers },
};

/** The same end state for a mixed session — different copy, same shape. */
export const MixedComplete: Story = {
  args: { card: null, total: 12, remaining: 0, readingLabel: 'Хирагана', ...handlers },
};
