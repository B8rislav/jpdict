import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent } from 'storybook/test';
import type { EntryListItem } from 'designoslav';
import { SentenceCardView, type StripToken } from './SentenceCardView';
import { posToEntry } from '../lib/posToEntry';
import type { SentenceToken } from '@/shared/api/types';
import { createTranslate } from '@/shared/i18n';

// Stories render views directly, outside the LocaleProvider, so they bind a
// translator explicitly instead of reading one from context.
const t = createTranslate('ru');

const jpTokens: SentenceToken[] = [
  {
    surface_form: '私',
    pos: '名詞',
    pos_detail_1: '代名詞',
    pos_detail_2: '一般',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '私',
    reading: 'ワタシ',
    pronunciation: 'ワタシ',
    gloss: 'я, 1-е лицо',
  },
  {
    surface_form: 'は',
    pos: '助詞',
    pos_detail_1: '係助詞',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: 'は',
    reading: 'ハ',
    pronunciation: 'ワ',
    gloss: 'частица темы',
  },
  {
    surface_form: '学生',
    pos: '名詞',
    pos_detail_1: '一般',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '学生',
    reading: 'ガクセイ',
    pronunciation: 'ガクセイ',
    gloss: 'студент, учащийся',
  },
  {
    surface_form: 'です',
    pos: '助動詞',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '特殊・デス',
    conjugated_form: '基本形',
    basic_form: 'です',
    reading: 'デス',
    pronunciation: 'デス',
    gloss: 'связка (быть)',
  },
];

const cnTokens: SentenceToken[] = [
  {
    surface_form: '我',
    pos: 'r',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '我',
    reading: 'wǒ',
    pronunciation: 'wǒ',
    gloss: 'я',
  },
  {
    surface_form: '爱',
    pos: 'v',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '爱',
    reading: 'ài',
    pronunciation: 'ài',
    gloss: 'любить',
  },
  {
    surface_form: '中国',
    pos: 'ns',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '中国',
    reading: 'Zhōngguó',
    pronunciation: 'Zhōngguó',
    gloss: 'Китай',
  },
];

const noop = () => Promise.resolve();
const tokenId = (i: number) => `t${i}`;

function toItems(tokens: SentenceToken[], language: 'jp' | 'cn'): EntryListItem[] {
  return tokens.map((token, i) => ({
    id: tokenId(i),
    headword: token.surface_form,
    reading: token.reading,
    pos: posToEntry(token, language),
    posLabel: t('pos', token.pos),
    posTag: token.pos,
    gloss: token.gloss ?? '—',
  }));
}

function toStrip(tokens: SentenceToken[], language: 'jp' | 'cn'): StripToken[] {
  return tokens.map((token, i) => ({
    id: tokenId(i),
    text: token.surface_form,
    pos: posToEntry(token, language),
  }));
}

function Controlled({
  sentence,
  tokens,
  language,
  onSelect,
}: {
  sentence: string;
  tokens: SentenceToken[];
  language: 'jp' | 'cn';
  onSelect?: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>();
  return (
    <SentenceCardView
      title={t('ui', 'sentence_title')}
      ariaLabel={t('ui', 'sentence_title')}
      stripTokens={toStrip(tokens, language)}
      items={toItems(tokens, language)}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id);
        onSelect?.(id);
      }}
      sentence={sentence}
      tokens={tokens}
      onFetchOverview={noop}
    />
  );
}

const meta: Meta<typeof SentenceCardView> = {
  title: 'features/SentenceCardView',
  component: SentenceCardView,
  decorators: [
    (Story) => (
      <div style={{ width: 860, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SentenceCardView>;

export const Japanese: Story = {
  render: () => <Controlled sentence="私は学生です。" tokens={jpTokens} language="jp" />,
};

export const Chinese: Story = {
  render: () => <Controlled sentence="我爱中国。" tokens={cnTokens} language="cn" />,
};

export const EmptyTokens: Story = {
  render: () => <Controlled sentence="テスト" tokens={[]} language="jp" />,
};

// Clicking a token in the sentence strip selects it; the matching entry card in
// the list picks up the selected state (shared selectedId).
export const ClickTokenSelects: Story = {
  render: () => <Controlled sentence="私は学生です。" tokens={jpTokens} language="jp" />,
  play: async ({ canvasElement }) => {
    // 学生 is token index 2 (id "t2"); click it in the strip.
    const radios = canvasElement.querySelectorAll<HTMLElement>('[role="radio"]');
    await userEvent.click(radios[2]);
    const selected = canvasElement.querySelector('[aria-current="true"]');
    await expect(selected).not.toBeNull();
    await expect(selected?.textContent).toContain('学生');
  },
};
