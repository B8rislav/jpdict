import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { type ReviewActivity } from '../api/types';
import { ActivityView } from './ActivityView';

const meta: Meta<typeof ActivityView> = {
  title: 'features/Review/ActivityView',
  component: ActivityView,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 680, margin: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityView>;

/**
 * Seven Monday-aligned weeks ending 2026-08-16 (a Sunday, so the grid ends flush).
 * Fixed rather than relative to `now` so the story reviews the same grid every time.
 */
function series(shape: (index: number) => number): ReviewActivity {
  const start = Date.UTC(2026, 5, 29);
  const days = Array.from({ length: 49 }, (_, index) => {
    const reviews = shape(index);
    return {
      date: new Date(start + index * 86_400_000).toISOString().slice(0, 10),
      reviews,
      new: reviews === 0 ? 0 : Math.min(reviews, 2 + (index % 4)),
      seconds: reviews === 0 ? null : reviews * 45,
    };
  });
  return { days, streak: 7 };
}

const RHYTHM = series((index) => (index % 13 === 4 ? 0 : (index % 7 >= 5 ? 3 : 9 + ((index * 7) % 17))));

/** The populated grid. Click any day to open its breakdown. */
export const Default: Story = {
  args: { activity: RHYTHM },
};

/** A new account: every cell empty, the widget still rendered. */
export const Empty: Story = {
  args: { activity: series(() => 0) },
};

/**
 * Nothing loaded yet. The component takes `null` rather than being conditionally
 * mounted, so the card keeps its place while the request is in flight.
 */
export const NoData: Story = {
  args: { activity: null },
};

/**
 * A history whose early days predate time tracking — selecting one shows «—» for
 * «Время» rather than "0 мин", which would claim a study session of no length.
 */
export const UntimedDays: Story = {
  args: {
    activity: {
      ...RHYTHM,
      days: RHYTHM.days.map((day, index) => (index < 20 ? { ...day, seconds: null } : day)),
    },
  },
};
