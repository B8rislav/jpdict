import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import LanguageCard from './LanguageCard';

const meta: Meta<typeof LanguageCard> = {
  title: 'features/LanguageCard',
  component: LanguageCard,
  decorators: [
    (Story) => (
      <div style={{ width: 320, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: { onSelect: fn() },
};

export default meta;
type Story = StoryObj<typeof LanguageCard>;

export const Japanese: Story = {
  args: {
    language: 'jp',
    title: 'Japanese',
    description:
      'Three writing systems: hiragana, katakana and kanji. JLPT levels for progress assessment.',
  },
};

export const Chinese: Story = {
  args: {
    language: 'cn',
    title: 'Chinese',
    description: 'Tonal pronunciation system. HSK levels for proficiency measurement.',
  },
};
