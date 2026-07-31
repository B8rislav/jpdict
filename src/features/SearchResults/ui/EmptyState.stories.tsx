import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'features/EmptyState',
  component: EmptyState,
  args: {
    examples: [
      { query: '私は毎日日本語を勉強します', label: 'Предложение' },
      { query: '勉強', label: 'Слово' },
      { query: '語', label: 'Кандзи' },
    ],
    onRun: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/** One example per lookup the classifier can pick. */
export const Default: Story = {};

/** Chinese study mode swaps the queries. */
export const ChineseExamples: Story = {
  args: {
    examples: [
      { query: '我每天学习中文', label: 'Предложение' },
      { query: '学习', label: 'Слово' },
      { query: '语', label: 'Кандзи' },
    ],
  },
};

/** A single example, to check the row doesn't depend on there being three. */
export const OneExample: Story = {
  args: { examples: [{ query: '勉強', label: 'Слово' }] },
};
