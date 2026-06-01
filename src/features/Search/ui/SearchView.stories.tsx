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
    setInputValue: fn(),
    onButtonClick: fn(),
    onSetQueryType: fn(),
    onSelectHistoryEntry: fn(),
    onDeleteHistoryEntry: fn(),
    onClearHistory: fn(),
    placeholder: 'Enter a word, kanji or sentence',
  },
};

export default meta;
type Story = StoryObj<typeof SearchView>;

export const Empty: Story = {
  args: { inputValue: '' },
};

export const Typing: Story = {
  args: {
    inputValue: 'やま',
    hintText: 'Showing results for: やま',
  },
};

export const Submitting: Story = {
  args: {
    inputValue: 'やま',
    isSubmitting: true,
  },
};

const historyEntries = [
  { id: '1', query: '山' },
  { id: '2', query: '学生' },
  { id: '3', query: '私は学生です' },
];

export const WithHistory: Story = {
  args: {
    inputValue: '',
    historyEntries,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('searchbox'));
  },
};

export const QueryTypeKanji: Story = {
  args: {
    inputValue: '山',
    queryType: 'kanji',
    queryTypeLabel: 'Kanji query',
  },
};

export const QueryTypeSentence: Story = {
  args: {
    inputValue: '私は学生です',
    queryType: 'sentence',
    queryTypeLabel: 'Sentence query',
  },
};

export const QueryTypeWord: Story = {
  args: {
    inputValue: '学生',
    queryType: 'word',
    queryTypeLabel: 'Word query',
  },
};
