import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { AccordionSection } from './AccordionSection';

const meta: Meta<typeof AccordionSection> = {
  title: 'shared/ui/AccordionSection',
  component: AccordionSection,
  decorators: [
    (Story) => (
      <div style={{ width: 400, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccordionSection>;

export const Closed: Story = {
  args: {
    title: 'Example section',
    defaultOpen: false,
    children: <p>Content revealed on expand.</p>,
  },
};

export const OpenByDefault: Story = {
  args: {
    title: 'Example section',
    defaultOpen: true,
    children: <p>Content visible immediately.</p>,
  },
};

export const WithOnFirstExpand: Story = {
  args: {
    title: 'Example section',
    defaultOpen: false,
    onFirstExpand: fn(),
    children: <p>Expand once to trigger the action.</p>,
  },
};
