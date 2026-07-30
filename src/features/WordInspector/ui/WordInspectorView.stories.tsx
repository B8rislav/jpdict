import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { createTranslate } from '@/shared/i18n';
import { type Kanji, type Word } from '@/shared/api/types';
import { type ReibunEntry } from '../api/fetchExampleSentences';
import { SECTION_EXAMPLES, SECTION_GRAMMAR, SECTION_TRANSLATION } from '../constants';
import { kanjiToInWord } from '../lib/kanjiToInWord';
import { WordInspectorView } from './WordInspectorView';

const t = createTranslate('ru');

const word: Word = {
  id: 'w1',
  kanji_full: '勉強',
  hiragana_full: 'べんきょう',
  def_ru: ['учёба', 'занятия'],
  def_en: ['study'],
  markers: ['JLPT N4'],
  typeofspeech: 'существительное',
  pitch: ['0'],
};

const rawKanji: Kanji[] = [
  {
    kanji: '勉',
    definition: 'усердие',
    radical: '力',
    radical_name: 'сила',
    markers: ['JLPT N3', '10 черт'],
    onyomi: 'ベン',
    kunyomi: 'つと.める',
    parts: [{ piece: '力', definition: 'сила' }],
  },
  {
    kanji: '強',
    definition: 'сильный',
    radical: '弓',
    radical_name: 'лук',
    markers: ['JLPT N4', '11 черт'],
    onyomi: 'キョウ',
    kunyomi: 'つよ.い',
    parts: [{ piece: '弓', definition: 'лук' }],
  },
];

const kanji = rawKanji.map((entry) => kanjiToInWord(entry, t));

const examples: ReibunEntry[] = [
  {
    id: 1,
    sentence_jp: '毎日日本語を勉強しています。',
    reading_jp: null,
    translation: 'Я каждый день изучаю японский.',
    translation_lang: 'ru',
  },
  {
    id: 2,
    sentence_jp: '勉強は大切です。',
    reading_jp: null,
    translation: 'Учёба важна.',
    translation_lang: 'ru',
  },
];

const meta: Meta<typeof WordInspectorView> = {
  title: 'features/WordInspectorView',
  component: WordInspectorView,
  decorators: [
    (Story) => (
      <div style={{ width: 620, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    word,
    kanji,
    exampleSentences: [],
    examplesPending: false,
    examplesRequested: false,
    openSections: { [SECTION_TRANSLATION]: true },
    isSaved: false,
    readingLabel: 'Хирагана',
    kanjiLabel: 'Кандзи в слове',
    onToggleSection: fn(),
    onExpandKanji: fn(),
    onSave: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WordInspectorView>;

/** Default: translation section open, others collapsed. */
export const Default: Story = {};

export const Saved: Story = {
  args: { isSaved: true },
};

export const GrammarOpen: Story = {
  args: { openSections: { [SECTION_TRANSLATION]: true, [SECTION_GRAMMAR]: true } },
};

/** Examples loading — three skeleton rows. */
export const ExamplesLoading: Story = {
  args: {
    openSections: { [SECTION_EXAMPLES]: true },
    examplesPending: true,
    examplesRequested: true,
  },
};

export const ExamplesLoaded: Story = {
  args: {
    openSections: { [SECTION_EXAMPLES]: true },
    exampleSentences: examples,
    examplesRequested: true,
  },
};

/** Requested but the backend had none — explicit empty message. */
export const ExamplesEmpty: Story = {
  args: {
    openSections: { [SECTION_EXAMPLES]: true },
    exampleSentences: [],
    examplesRequested: true,
  },
};

export const KanjiExpanded: Story = {
  args: { expandedKanjiId: '勉' },
};

/** Kana-only word: no characters to break down. */
export const NoKanji: Story = {
  args: {
    word: { id: 'w2', hiragana_full: 'ありがとう', def_ru: ['спасибо'], markers: [] },
    kanji: [],
  },
};

/** Chinese word, pinyin reading label. */
export const Chinese: Story = {
  args: {
    word: {
      id: 'w3',
      kanji_full: '学习',
      hiragana_full: 'xuéxí',
      def_ru: ['учиться'],
      markers: ['HSK 1'],
    },
    kanji: [],
    readingLabel: 'Пиньинь',
    kanjiLabel: 'Иероглифы в слове',
  },
};

/** Interactive: sections open and close, characters expand. */
const Controlled = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [SECTION_TRANSLATION]: true,
  });
  const [expandedKanjiId, setExpandedKanjiId] = useState<string>();

  return (
    <WordInspectorView
      word={word}
      kanji={kanji}
      exampleSentences={examples}
      examplesPending={false}
      examplesRequested
      openSections={openSections}
      expandedKanjiId={expandedKanjiId}
      isSaved={false}
      readingLabel="Хирагана"
      kanjiLabel="Кандзи в слове"
      onToggleSection={(id) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))}
      onExpandKanji={(id) => setExpandedKanjiId((current) => (current === id ? undefined : id))}
      onSave={fn()}
    />
  );
};

export const Interactive: Story = {
  render: () => <Controlled />,
};
