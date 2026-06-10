import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SentenceHighlight } from './SentenceHighlight';
import type { SentenceToken } from '@/shared/api/types';

const t = (surface_form: string, pos: string, reading?: string): SentenceToken => ({
  surface_form,
  pos,
  pos_detail_1: '',
  pos_detail_2: '',
  pos_detail_3: '',
  conjugated_type: '',
  conjugated_form: '',
  basic_form: surface_form,
  reading,
});

const jpTokens: SentenceToken[] = [
  t('この', '連体詞'),
  t('本', '名詞', 'ホン'),
  t('は', '助詞'),
  t('とても', '副詞'),
  t('面白い', '形容詞', 'オモシロイ'),
  t('です', '助動詞'),
];

const cnTokens: SentenceToken[] = [
  t('我', 'pronoun', 'wǒ'),
  t('爱', 'verb', 'ài'),
  t('中国', 'noun', 'Zhōngguó'),
];

const meta: Meta<typeof SentenceHighlight> = {
  title: 'features/SentenceHighlight',
  component: SentenceHighlight,
  decorators: [
    (Story) => (
      <div style={{ width: 640, margin: 25, fontSize: 22 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    selectedTokenIndex: null,
    onTokenSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SentenceHighlight>;

export const Japanese: Story = {
  args: {
    sentence: 'この本はとても面白いです。',
    tokens: jpTokens,
    selectedLanguage: 'jp',
  },
};

export const Chinese: Story = {
  args: {
    sentence: '我爱中国。',
    tokens: cnTokens,
    selectedLanguage: 'cn',
  },
};

export const Selected: Story = {
  args: {
    sentence: 'この本はとても面白いです。',
    tokens: jpTokens,
    selectedLanguage: 'jp',
    selectedTokenIndex: 4,
  },
};

export const ClickSelectsToken: Story = {
  args: {
    sentence: 'この本はとても面白いです。',
    tokens: jpTokens,
    selectedLanguage: 'jp',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('面白い'));
    // 面白い is token index 4 — the span click must report that index.
    await expect(args.onTokenSelect).toHaveBeenCalledWith(4);
  },
};
