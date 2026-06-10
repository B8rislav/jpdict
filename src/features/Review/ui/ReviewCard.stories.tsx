import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';
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

const sipCard: ReviewCardData = {
  ...reviewedCard,
  id: '3',
  kanji_full: '飲む',
  hiragana_full: 'のむ',
  def_en: ['to drink'],
};
const cycle = [reviewedCard, newCard, sipCard];

/**
 * Drives the real keyboard path on a timer — Space to flip, then a digit to
 * grade — so you can watch the 3D flip, the grade-direction fling, and the
 * card-to-card swap loop without touching anything. Also exercises the
 * "spamming keys never desyncs the animation from the data" guarantee.
 */
const AutoPlayer = ({ onGrade }: { onGrade: (g: string) => void }) => {
  const [i, setI] = useState(0);
  const card = cycle[i % cycle.length];

  useEffect(() => {
    const reveal = setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    }, 900);
    const grade = setTimeout(() => {
      const key = String(((i % 4) + 1) as 1 | 2 | 3 | 4);
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }, 1800);
    return () => {
      clearTimeout(reveal);
      clearTimeout(grade);
    };
  }, [i]);

  return (
    <AnimatePresence mode="wait">
      <ReviewCard
        key={card.id}
        card={card}
        readingLabel="Hiragana"
        onGrade={(g) => {
          onGrade(g);
          setI((n) => n + 1);
        }}
      />
    </AnimatePresence>
  );
};

export const AutoPlay: Story = {
  render: () => <AutoPlayer onGrade={fn()} />,
};

/** Same card, reduced motion forced: flip/fling collapse to instant face-swaps. */
export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <ReviewCard card={reviewedCard} readingLabel="Hiragana" onGrade={fn()} initiallyRevealed />
    </MotionConfig>
  ),
};
