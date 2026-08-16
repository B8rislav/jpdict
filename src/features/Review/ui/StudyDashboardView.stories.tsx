import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { type ReviewActivity, type ReviewStats } from '../api/types';
import { ActivityView } from './ActivityView';
import { StudyDashboardView } from './StudyDashboardView';

const meta: Meta<typeof StudyDashboardView> = {
  title: 'features/Review/StudyDashboardView',
  component: StudyDashboardView,
  decorators: [
    (Story) => (
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudyDashboardView>;

const STATS: ReviewStats = {
  new: 2,
  due: 2,
  learned: 6,
  suspended: 0,
  decks: [],
  doneToday: 4,
  dailyGoal: 10,
};

const ACTIVITY: ReviewActivity = {
  streak: 7,
  days: Array.from({ length: 49 }, (_, index) => {
    const reviews = index % 13 === 4 ? 0 : index % 7 >= 5 ? 3 : 9 + ((index * 7) % 17);
    return {
      date: new Date(Date.UTC(2026, 5, 29) + index * 86_400_000).toISOString().slice(0, 10),
      reviews,
      new: reviews === 0 ? 0 : 2,
      seconds: reviews === 0 ? null : reviews * 45,
    };
  }),
};

/** The dashboard with work waiting — four cards due, the CTA live. */
export const Default: Story = {
  args: { stats: STATS, activity: ACTIVITY, loading: false, onStart: fn() },
  render: (args) => (
    <StudyDashboardView {...args}>
      <ActivityView activity={args.activity} />
    </StudyDashboardView>
  ),
};

/**
 * Everything reviewed. The CTA stays in place but disabled, rather than vanishing
 * and reflowing the page under the reader.
 */
export const AllCaughtUp: Story = {
  args: {
    stats: { ...STATS, new: 0, due: 0, doneToday: 10 },
    activity: ACTIVITY,
    loading: false,
    onStart: fn(),
  },
  render: (args) => (
    <StudyDashboardView {...args}>
      <ActivityView activity={args.activity} />
    </StudyDashboardView>
  ),
};

/**
 * A brand-new account. Every widget still renders — a zeroed streak and an empty
 * grid teach what the app tracks; hiding them would make the page change shape as
 * the user starts studying.
 */
export const EmptyAccount: Story = {
  args: {
    stats: { ...STATS, new: 0, due: 0, learned: 0, doneToday: 0 },
    activity: { streak: 0, days: ACTIVITY.days.map((day) => ({ ...day, reviews: 0, new: 0, seconds: null })) },
    loading: false,
    onStart: fn(),
  },
  render: (args) => (
    <StudyDashboardView {...args}>
      <ActivityView activity={args.activity} />
    </StudyDashboardView>
  ),
};

/** In flight: skeletons hold each widget's height so nothing jumps when data lands. */
export const Loading: Story = {
  args: { stats: null, activity: null, loading: true, onStart: fn() },
};
