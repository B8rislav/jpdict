import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KanjiCard } from './KanjiCard';

const meta: Meta<typeof KanjiCard> = {
  title: 'features/KanjiCard',
  component: KanjiCard,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanjiCard>;

export const Primary: Story = {
  args: {
    kanji: '山',
    definition: 'mountain',
    radical: '山',
    radical_name: 'Mountain',
    markers: [' JLPT N3', 'Frequency 1000'],
    kunyomi: 'やま',
    onyomi: 'サン, セン, シャン',
    parts: [
      { piece: '山', definition: 'mountain' },
      { piece: '岳', definition: 'mountain peak' },
    ],
  },
};
