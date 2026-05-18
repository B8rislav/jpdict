import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DictionaryWordCard } from './DictionaryWordCard';

const meta: Meta<typeof DictionaryWordCard> = {
  title: 'features/DictionaryWordCard',
  component: DictionaryWordCard,
  decorators: [
    (Story) => (
      <div style={{ width: 500, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DictionaryWordCard>;

const baseWord = {
  id: '239',
  hiragana_full: 'こちら',
  def: ['this way, this direction', 'here', 'this one'],
  markers: ['JLPT N5'],
  savedAt: '2026-05-19T10:00:00.000Z',
};

export const New: Story = {
  args: {
    word: { ...baseWord, status: 'new' },
  },
};

export const Learning: Story = {
  args: {
    word: {
      ...baseWord,
      id: '1419',
      kanji_full: '此方',
      status: 'learning',
    },
  },
};

export const Known: Story = {
  args: {
    word: {
      ...baseWord,
      id: '500',
      kanji_full: '食べる',
      hiragana_full: 'たべる',
      def: ['to eat', 'to live on (e.g. a salary)'],
      markers: ['JLPT N5', 'News/Web 10k'],
      status: 'known',
    },
  },
};

export const HSKWord: Story = {
  args: {
    word: {
      ...baseWord,
      id: '2',
      kanji_full: '国家',
      hiragana_full: 'Guójiā',
      def: ['state, country, nation'],
      markers: ['HSK 2'],
      status: 'new',
    },
  },
};

export const NoKanji: Story = {
  args: {
    word: { ...baseWord, kanji_full: undefined, status: 'learning' },
  },
};
