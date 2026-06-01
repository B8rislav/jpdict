import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardList } from './CardList';

const meta: Meta<typeof CardList> = {
  title: 'shared/ui/CardList',
  component: CardList,
  decorators: [
    (Story) => (
      <div style={{ width: 600, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardList>;

export const Loading: Story = {
  args: { loading: true, listHeight: 750 },
};

export const WithChildren: Story = {
  args: {
    loading: false,
    children: (
      <>
        <li style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>Card one</li>
        <li style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>Card two</li>
        <li style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>Card three</li>
      </>
    ),
  },
};

export const Empty: Story = {
  args: { loading: false },
};
