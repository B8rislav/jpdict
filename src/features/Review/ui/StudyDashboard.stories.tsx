import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StudyDashboard } from './StudyDashboard';

const meta: Meta<typeof StudyDashboard> = {
  title: 'features/StudyDashboard',
  component: StudyDashboard,
  decorators: [
    (Story) => (
      <div style={{ width: 480, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudyDashboard>;

const noop = () => {};

export const WithCards: Story = {
  args: { stats: { due: 12, new: 5, learned: 84, suspended: 3 }, onStart: noop },
};

export const Empty: Story = {
  args: { stats: { due: 0, new: 0, learned: 84, suspended: 0 }, onStart: noop },
};

export const Loading: Story = {
  args: { stats: null, onStart: noop },
};
