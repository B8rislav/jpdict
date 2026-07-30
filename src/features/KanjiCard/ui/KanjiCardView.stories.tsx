import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KanjiCardView } from './KanjiCardView';

const meta: Meta<typeof KanjiCardView> = {
  title: 'features/KanjiCardView',
  component: KanjiCardView,
  decorators: [
    (Story) => (
      <div style={{ width: 560, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanjiCardView>;

/** Japanese: on'yomi and kun'yomi rows, no pinyin. */
export const Japanese: Story = {
  args: {
    selectedLanguage: 'jp',
    kanji: '語',
    definition: 'язык, слово',
    radical: '言',
    radical_name: 'речь',
    markers: ['JLPT N5', '14 черт'],
    onyomi: 'ゴ',
    kunyomi: 'かた.る、かた.らう',
    parts: [
      { piece: '言', definition: 'речь' },
      { piece: '五', definition: 'пять' },
      { piece: '口', definition: 'рот' },
    ],
  },
};

/** Chinese: pinyin replaces the reading rows. */
export const Chinese: Story = {
  args: {
    selectedLanguage: 'cn',
    kanji: '经',
    definition: 'проходить,经济',
    radical: '纟',
    radical_name: 'шёлк',
    markers: ['HSK 3'],
    pinyin: 'jīng',
    parts: [{ piece: '纟', definition: 'шёлк' }],
  },
};

/** No language selected: neither reading block renders. */
export const NoLanguage: Story = {
  args: {
    selectedLanguage: null,
    kanji: '水',
    definition: 'вода',
    radical: '水',
    radical_name: 'вода',
    markers: ['JLPT N5'],
  },
};

/** Sparse entry — no parts, no readings. */
export const Minimal: Story = {
  args: {
    selectedLanguage: 'jp',
    kanji: '々',
    definition: 'знак повтора',
    markers: [],
  },
};
