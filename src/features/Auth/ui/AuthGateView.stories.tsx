import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { AuthGateView } from './AuthGateView';

const meta: Meta<typeof AuthGateView> = {
  title: 'features/AuthGateView',
  component: AuthGateView,
  decorators: [
    (Story) => (
      <div style={{ width: 640, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: { onSignIn: fn() },
};

export default meta;
type Story = StoryObj<typeof AuthGateView>;

export const Dictionary: Story = {
  args: { title: 'Мой словарь' },
};

export const Study: Story = {
  args: { title: 'Повторение' },
};

/** A long title must wrap rather than push the button off the row. */
export const LongTitle: Story = {
  args: { title: 'Персональный словарь с очень длинным названием раздела' },
};
