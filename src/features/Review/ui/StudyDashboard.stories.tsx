import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';
import { StudyDashboard } from './StudyDashboard';

const meta: Meta<typeof StudyDashboard> = {
  title: 'features/StudyDashboard',
  component: StudyDashboard,
  decorators: [
    (Story) => (
      <div style={{ width: 480, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudyDashboard>;

const noop = () => {};

export const WithCards: Story = {
  args: { stats: { due: 12, new: 5, learned: 84, suspended: 3 }, onStart: noop },
};

export const Empty: Story = {
  args: { stats: { due: 0, new: 0, learned: 84, suspended: 0 }, onStart: noop },
};

export const Loading: Story = {
  args: { stats: null, onStart: noop },
};

/** Bumps the stats on a timer so you can re-watch the counters tick to new values. */
const Replayer = () => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => v + 1), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <StudyDashboard
      stats={{ due: 12 + n * 7, new: 5 + n * 2, learned: 84 + n * 11, suspended: 3 }}
      onStart={fn()}
    />
  );
};

export const CountUpReplay: Story = {
  render: () => <Replayer />,
};

/** Reduced motion: counters show their final values immediately, no pulse. */
export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <StudyDashboard stats={{ due: 12, new: 5, learned: 84, suspended: 3 }} onStart={fn()} />
    </MotionConfig>
  ),
};
