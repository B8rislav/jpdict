import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EntryList, KanjiCard, SectionHeading, WordCard } from 'designoslav';
import { SearchResultsView } from './SearchResultsView';

const meta: Meta<typeof SearchResultsView> = {
  title: 'features/SearchResultsView',
  component: SearchResultsView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SearchResultsView>;

const entries = [
  {
    id: 'a',
    headword: '私',
    reading: 'わたし',
    pos: 'pronoun' as const,
    posLabel: 'Местоимение',
    posTag: '代名詞',
    gloss: 'я, 1-е лицо',
  },
  {
    id: 'b',
    headword: 'は',
    pos: 'particle' as const,
    posLabel: 'Частица',
    posTag: '助詞',
    gloss: 'частица темы',
  },
  {
    id: 'c',
    headword: '毎日',
    reading: 'まいにち',
    pos: 'noun' as const,
    posLabel: 'Существительное',
    posTag: '名詞',
    gloss: 'каждый день',
  },
  {
    id: 'd',
    headword: '日本語',
    reading: 'にほんご',
    pos: 'noun' as const,
    posLabel: 'Существительное',
    posTag: '名詞',
    gloss: 'японский язык',
  },
];

/** The sentence layout: breakdown on the left, the selected word on the right. */
export const Split: Story = {
  args: {
    results: (
      <>
        <SectionHeading>Предложение</SectionHeading>
        <EntryList aria-label="Разбор предложения" items={entries} selectedId="d" />
      </>
    ),
    detail: (
      <WordCard
        word="日本語"
        pos="Существительное"
        reading="Хирагана: にほんご"
        sections={[
          {
            id: 't',
            title: 'Перевод',
            open: true,
            content: (
              <ol>
                <li>японский язык</li>
              </ol>
            ),
          },
        ]}
      />
    ),
  },
};

/** A kanji lookup returns exactly one card, so the grid collapses to one column. */
export const Single: Story = {
  args: {
    layout: 'single',
    detail: (
      <KanjiCard
        kanji="語"
        meaning="язык; слово; рассказывать"
        readings="ゴ・かた.る"
        jlpt="JLPT N5"
        strokeCount="14 черт"
      />
    ),
  },
};

export const Loading: Story = {
  args: { loading: true },
};
