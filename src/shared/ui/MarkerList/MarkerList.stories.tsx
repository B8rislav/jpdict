import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MarkerList } from './MarkerList';

const meta: Meta<typeof MarkerList> = {
  title: 'shared/ui/MarkerList',
  component: MarkerList,
  decorators: [
    (Story) => (
      <div style={{ width: 400, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MarkerList>;

export const Empty: Story = {
  args: { markers: [] },
};

export const OneMarker: Story = {
  args: { markers: ['JLPT N3'] },
};

export const ManyMarkers: Story = {
  args: { markers: ['N1', 'common', '音読み', '形容詞'] },
};
