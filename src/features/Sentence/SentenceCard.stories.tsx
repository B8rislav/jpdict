import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SentenceCardView } from './ui/SentenceCardView';
import type { SentenceToken } from '@/shared/api/types';

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
  },
];

const cnTokens: SentenceToken[] = [
  {
    surface_form: '我',
    pos: 'pronoun',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '我',
    reading: 'wǒ',
    pronunciation: 'wǒ',
  },
  {
    surface_form: '爱',
    pos: 'verb',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '爱',
    reading: 'ài',
    pronunciation: 'ài',
  },
  {
    surface_form: '中国',
    pos: 'noun',
    pos_detail_1: '',
    pos_detail_2: '',
    pos_detail_3: '',
    conjugated_type: '',
    conjugated_form: '',
    basic_form: '中国',
    reading: 'Zhōngguó',
    pronunciation: 'Zhōngguó',
  },
];

const noop = () => Promise.resolve();

const meta: Meta<typeof SentenceCardView> = {
  title: 'features/SentenceCard',
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
  args: {
    sentence: '私は学生です。',
    tokens: jpTokens,
    selectedLanguage: 'jp',
    showFurigana: true,
    showPinyin: false,
    onTokenClick: () => {},
    onFetchOverview: noop,
  },
};

export const Chinese: Story = {
  args: {
    sentence: '我爱中国。',
    tokens: cnTokens,
    selectedLanguage: 'cn',
    showFurigana: false,
    showPinyin: true,
    onTokenClick: () => {},
    onFetchOverview: noop,
  },
};

export const EmptyTokens: Story = {
  args: {
    sentence: 'テスト',
    tokens: [],
    selectedLanguage: 'jp',
    showFurigana: true,
    showPinyin: false,
    onTokenClick: () => {},
    onFetchOverview: noop,
  },
};
