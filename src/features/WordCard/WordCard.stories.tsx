import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WordCardView } from './ui/WordCardView';

const meta: Meta<typeof WordCardView> = {
  title: 'features/WordCard',
  component: WordCardView,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WordCardView>;

export const Primary: Story = {
  args: {
    kanji_full: '山',
    hiragana_full: 'やま',
    def_en: ['mountain', 'hill'],
    markers: [' JLPT N3', 'Frequency 1000'],
    readingLabel: 'Hiragana',
    isSaved: false,
    onSave: () => {},
  },
};

export const Saved: Story = {
  args: {
    kanji_full: '山',
    hiragana_full: 'やま',
    def_en: ['mountain', 'hill'],
    markers: [' JLPT N3', 'Frequency 1000'],
    readingLabel: 'Hiragana',
    isSaved: true,
    onSave: () => {},
  },
};

export const ChineseWord: Story = {
  args: {
    kanji_full: '国家',
    hiragana_full: 'Guójiā',
    def_en: ['state, country, nation'],
    markers: ['HSK 2'],
    readingLabel: 'Pinyin',
    isSaved: false,
    onSave: () => {},
  },
};
