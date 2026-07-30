import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { CountUp } from './CountUp';

const meta: Meta<typeof CountUp> = {
  title: 'shared/CountUp',
  component: CountUp,
  decorators: [
    (Story) => (
      <div style={{ fontSize: 48, fontWeight: 700, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CountUp>;

export const Zero: Story = { args: { value: 0 } };

export const SmallNumber: Story = { args: { value: 12 } };

export const LargeNumber: Story = { args: { value: 12480 } };

/** Re-mounts on a timer so the tick animation can be watched repeatedly. */
const Ticker = () => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setValue((current) => current + 137), 2000);
    return () => clearInterval(timer);
  }, []);
  return <CountUp value={value} />;
};

export const Animating: Story = {
  render: () => <Ticker />,
};

/** Reduced motion: lands on the final value with no counting. */
export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <CountUp value={4821} />
    </MotionConfig>
  ),
};
