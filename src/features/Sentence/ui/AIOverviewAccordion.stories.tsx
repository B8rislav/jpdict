import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import { AIOverviewAccordion } from './AIOverviewAccordion';
import type { SentenceToken } from '@/shared/api/types';

const tokens: SentenceToken[] = [
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
  },
];

const clickExpand = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  // Use index rather than text: the component is locale-aware and the button
  // label changes language. When collapsed there is exactly one button.
  const [button] = canvas.getAllByRole('button');
  await userEvent.click(button);
};

const meta: Meta<typeof AIOverviewAccordion> = {
  title: 'features/AIOverviewAccordion',
  component: AIOverviewAccordion,
  decorators: [
    (Story) => (
      <div style={{ width: 700, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    sentence: '私は学生です。',
    tokens,
  },
};

export default meta;
type Story = StoryObj<typeof AIOverviewAccordion>;

export const Collapsed: Story = {
  args: { onFetchOverview: () => Promise.resolve() },
};

export const Streaming: Story = {
  args: {
    onFetchOverview: async (onChunk) => {
      const chunks = [
        '## Analysis\n\n',
        'This sentence means **"I am a student."**\n\n',
        '- 私 (*watashi*) — first-person pronoun\n',
        '- は — topic-marking particle\n',
        '- 学生 (*gakusei*) — student\n',
        '- です — polite copula\n',
      ];
      for (const chunk of chunks) {
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            onChunk(chunk);
            resolve();
          }, 400),
        );
      }
    },
  },
  play: clickExpand,
};

export const Loaded: Story = {
  args: {
    onFetchOverview: async (onChunk) => {
      onChunk(
        '## Analysis\n\nThis sentence means **"I am a student."**\n\n' +
          '- 私 (*watashi*) — first-person pronoun\n' +
          '- は — topic-marking particle\n' +
          '- 学生 (*gakusei*) — student (名詞 + 一般)\n' +
          '- です — polite copula (助動詞)',
      );
    },
  },
  play: clickExpand,
};

export const FetchError: Story = {
  args: {
    onFetchOverview: async () => {
      throw new Error('OpenRouter quota exceeded');
    },
  },
  play: clickExpand,
};
