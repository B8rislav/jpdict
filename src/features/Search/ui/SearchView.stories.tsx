import type { SearchOptionItem } from 'designoslav';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within } from 'storybook/test';

import { SearchView } from './SearchView';

const meta: Meta<typeof SearchView> = {
  title: 'features/SearchView',
  component: SearchView,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onValueChange: fn(),
    onSubmit: fn(),
    onSelectOption: fn(),
    onClearHistory: fn(),
    placeholder: 'Введите слово, кандзи или предложение',
    options: [],
    mode: 'suggest',
  },
};

export default meta;
type Story = StoryObj<typeof SearchView>;

/** The four parse variants offered for 勉強, mirroring the board mockup. */
const parseOptions: SearchOptionItem[] = [
  { id: 'word-勉強', unit: 'word', text: '勉強', hint: 'разобрать как слово', unitLabel: 'Слово' },
  {
    id: 'verb-勉強する',
    unit: 'word',
    text: '勉強する',
    hint: 'учиться · глагол',
    unitLabel: 'Слово',
  },
  { id: 'kanji-勉', unit: 'kanji', text: '勉', hint: 'усердие · N3', unitLabel: 'Кандзи' },
  {
    id: 'phrase',
    unit: 'phrase',
    text: '私は毎日日本語を勉強します',
    hint: 'полный разбор предложения',
    unitLabel: 'Фраза',
  },
];

const historyItems: SearchOptionItem[] = [
  { id: '1', unit: 'kanji', text: '山', unitLabel: 'Кандзи' },
  { id: '2', unit: 'word', text: '学生', unitLabel: 'Слово' },
  { id: '3', unit: 'phrase', text: '私は学生です', unitLabel: 'Фраза' },
];

const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole('searchbox'));
};

/** Blank field, unfocused — no popover. */
export const Empty: Story = {
  args: { inputValue: '', mode: 'history', options: [] },
};

/** Typing a query surfaces the «Варианты разбора» parse options. */
export const ParseOptions: Story = {
  args: { inputValue: '勉強', mode: 'suggest', options: parseOptions },
  play: open,
};

/** Empty + focused shows «История поиска» with recent searches. */
export const WithHistory: Story = {
  args: { inputValue: '', mode: 'history', options: historyItems },
  play: open,
};

/** The action button reflects the in-flight search. */
export const Submitting: Story = {
  args: { inputValue: '勉強', mode: 'suggest', options: parseOptions, isSubmitting: true },
};
