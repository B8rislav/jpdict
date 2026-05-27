import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KanjiCardView } from './ui/KanjiCardView';

const meta: Meta<typeof KanjiCardView> = {
  title: 'features/KanjiCard',
  component: KanjiCardView,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanjiCardView>;

export const Japanese: Story = {
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
    selectedLanguage: 'jp',
  },
};

export const Chinese: Story = {
  args: {
    kanji: '山',
    definition: 'mountain',
    radical: '山',
    radical_name: 'shān',
    markers: ['HSK 1'],
    kunyomi: '',
    onyomi: '',
    parts: [],
    selectedLanguage: 'cn',
  },
};
