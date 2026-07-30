import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { WordCardView } from './WordCardView';

const meta: Meta<typeof WordCardView> = {
  title: 'features/WordCardView',
  component: WordCardView,
  decorators: [
    (Story) => (
      <div style={{ width: 560, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    kanji_full: '勉強',
    hiragana_full: 'べんきょう',
    def_ru: ['учёба', 'занятия'],
    def_en: ['study', 'diligence'],
    markers: ['JLPT N4'],
    typeofspeech: 'существительное',
    readingLabel: 'Хирагана',
    isSaved: false,
    onSave: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WordCardView>;

export const Unsaved: Story = {};

/** Saved: the button switches to a confirmation and disables. */
export const Saved: Story = {
  args: { isSaved: true },
};

/** Kana-only word — no kanji line to show. */
export const KanaOnly: Story = {
  args: { kanji_full: undefined, hiragana_full: 'ありがとう', def_ru: ['спасибо'] },
};

export const Chinese: Story = {
  args: {
    kanji_full: '学习',
    hiragana_full: 'xuéxí',
    def_ru: ['учиться'],
    markers: ['HSK 1'],
    readingLabel: 'Пиньинь',
  },
};

/** Many senses — checks the definition list doesn't overflow the card. */
export const ManyDefinitions: Story = {
  args: {
    def_ru: ['учёба', 'занятия', 'изучение', 'штудирование', 'усердие', 'прилежание'],
  },
};

/** No markers and no part of speech. */
export const Minimal: Story = {
  args: { markers: [], typeofspeech: undefined, def_ru: ['вода'] },
};
