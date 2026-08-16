import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { DictionaryFiltersView } from './DictionaryFiltersView';

const meta: Meta<typeof DictionaryFiltersView> = {
  title: 'features/DictionaryFiltersView',
  component: DictionaryFiltersView,
  args: {
    deck: 'word',
    language: 'jp',
    level: 'all',
    status: 'all',
    q: '',
    shown: 8,
    onLevelChange: fn(),
    onStatusChange: fn(),
    onQueryChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DictionaryFiltersView>;

export const Default: Story = {};

/** Filters applied: N4 and «Учу», with the shown count reflecting the narrower match set. */
export const Filtered: Story = {
  args: { level: 'N4', status: 'learning', shown: 2 },
};

/** The Chinese study language swaps the level scale from JLPT to HSK. */
export const ChineseLevels: Story = {
  args: { language: 'cn', level: 'HSK 3', shown: 4 },
};

/** The kanji deck asks for a character rather than a word. */
export const KanjiDeck: Story = {
  args: { deck: 'kanji', shown: 7 },
};

/** Live: typing and toggling drive the same controlled props the container supplies. */
export const Interactive: Story = {
  render: (args) => {
    const [level, setLevel] = useState(args.level);
    const [status, setStatus] = useState(args.status);
    const [q, setQ] = useState(args.q);

    return (
      <DictionaryFiltersView
        {...args}
        level={level}
        status={status}
        q={q}
        onLevelChange={setLevel}
        onStatusChange={setStatus}
        onQueryChange={setQ}
      />
    );
  },
};
