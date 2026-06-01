import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DefinitionList } from './DefinitionList';

const meta: Meta<typeof DefinitionList> = {
  title: 'shared/ui/DefinitionList',
  component: DefinitionList,
  decorators: [
    (Story) => (
      <div style={{ width: 400, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DefinitionList>;

export const SingleItem: Story = {
  args: { items: ['mountain'] },
};

export const MultipleItems: Story = {
  args: { items: ['mountain', 'hill', 'high ground'] },
};

export const LongDefinitions: Story = {
  args: {
    items: [
      'a large natural elevation of earth rising abruptly from the surrounding level',
      'a natural raised area of land, not as high or craggy as a mountain',
      'any heap or mound resembling a hill, especially an artificial one',
    ],
  },
};
