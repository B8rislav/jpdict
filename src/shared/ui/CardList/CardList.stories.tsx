import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MotionConfig, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cardEnter } from '@/shared/motion';
import { CardList } from './CardList';

const meta: Meta<typeof CardList> = {
  title: 'shared/ui/CardList',
  component: CardList,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardList>;

export const Loading: Story = {
  args: { loading: true, listHeight: 750 },
};

export const WithChildren: Story = {
  args: {
    loading: false,
    children: (
      <>
        <li style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>Card one</li>
        <li style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>Card two</li>
        <li style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>Card three</li>
      </>
    ),
  },
};

export const Empty: Story = {
  args: { loading: false },
};

const liStyle = {
  listStyle: 'none',
  padding: 16,
  border: '1px solid #ccc',
  borderRadius: 8,
  background: '#fff',
};

const SETS = [
  ['一', '二', '三', '四'],
  ['五', '六', '七', '八', '九'],
];

const Items = ({ values }: { values: string[] }) => (
  <>
    {values.map((v) => (
      <motion.li key={v} variants={cardEnter} exit="exit" layout style={liStyle}>
        {v}
      </motion.li>
    ))}
  </>
);

/** Toggles between two result sets on a timer: watch the stagger-in, then the
    old set animate out (popLayout) as the new set cascades in. */
const StaggerSwapper = () => {
  const [which, setWhich] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWhich((w) => (w + 1) % SETS.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <CardList loading={false}>
      <Items values={SETS[which]} />
    </CardList>
  );
};

export const StaggerSwap: Story = {
  render: () => <StaggerSwapper />,
};

/** Reduced motion: no stagger, no swap animation — content just appears. */
export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <CardList loading={false}>
        <Items values={SETS[1]} />
      </CardList>
    </MotionConfig>
  ),
};
