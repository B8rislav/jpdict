import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'shared/ui/Card',
  component: Card,
  decorators: [
    (Story) => (
      <div style={{ width: 400, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    children: <p>Card content goes here.</p>,
  },
};
