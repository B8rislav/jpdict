import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { LanguageSelectView } from './LanguageSelectView';

const meta: Meta<typeof LanguageSelectView> = {
  title: 'features/LanguageSelectView',
  component: LanguageSelectView,
  args: { onSelect: fn() },
};

export default meta;
type Story = StoryObj<typeof LanguageSelectView>;

/** The first-run overlay. Switch the locale in the toolbar to check both. */
export const Default: Story = {};
