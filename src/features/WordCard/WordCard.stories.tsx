import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WordCard } from './WordCard';

const meta: Meta<typeof WordCard> = {
  title: 'features/WordCard',
  component: WordCard,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WordCard>;

export const Primary: Story = {
  args: {
    kanji_full: '山',
    hiragana_full: 'やま',
    def: ['mountain', 'hill'],
    markers: [' JLPT N3', 'Frequency 1000'],
  },
};
