import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReviewCard } from './ReviewCard';
import { type ReviewCard as ReviewCardData } from '../api/types';

const meta: Meta<typeof ReviewCard> = {
  title: 'features/ReviewCard',
  component: ReviewCard,
  decorators: [
    (Story) => (
      <div style={{ width: 480, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReviewCard>;

const noop = () => {};

// A card reviewed a few times: later reps scale by ease, so intervals differ per grade.
const reviewedCard: ReviewCardData = {
  id: '1',
  language: 'jp',
  kanji_full: '食べる',
  hiragana_full: 'たべる',
  def_en: ['to eat', 'to live on (e.g. a salary)'],
  markers: ['JLPT N5'],
  status: 'learning',
  dueAt: '2026-06-10T00:00:00Z',
  intervalDays: 6,
  easeFactor: 2.5,
  repetitions: 2,
  lapses: 0,
  lastReviewedAt: '2026-06-04T00:00:00Z',
  suspended: false,
  // Review-phase projections (seconds): again lapses to 1m, the rest grow in days.
  projectedIntervals: { again: 60, hard: 604800, good: 1296000, easy: 1728000 },
};

// A brand-new card still in learning: again/hard 1m, good 10m, easy graduates to 4d.
const newCard: ReviewCardData = {
  ...reviewedCard,
  id: '2',
  status: 'new',
  dueAt: null,
  intervalDays: 0,
  repetitions: 0,
  lastReviewedAt: null,
  projectedIntervals: { again: 60, hard: 60, good: 600, easy: 345600 },
};

export const Front: Story = {
  args: { card: reviewedCard, readingLabel: 'Hiragana', onGrade: noop },
};

export const Revealed: Story = {
  args: { card: reviewedCard, readingLabel: 'Hiragana', onGrade: noop, initiallyRevealed: true },
};

export const NewCardRevealed: Story = {
  args: { card: newCard, readingLabel: 'Hiragana', onGrade: noop, initiallyRevealed: true },
};
