import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FuriganaText } from './FuriganaText';

const meta: Meta<typeof FuriganaText> = {
  title: 'shared/FuriganaText',
  component: FuriganaText,
  decorators: [
    (Story) => (
      <div style={{ fontSize: 32, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FuriganaText>;

export const WithFurigana: Story = {
  args: { surface: '山', reading: 'やま', show: true },
};

export const FuriganaHidden: Story = {
  args: { surface: '山', reading: 'やま', show: false },
};

export const SurfaceEqualsReading: Story = {
  name: 'Hiragana (no ruby — surface === reading)',
  args: { surface: 'やま', reading: 'やま' },
};

export const NoReading: Story = {
  args: { surface: '食べる' },
};

export const MultiCharWord: Story = {
  args: { surface: '東京', reading: 'とうきょう', show: true },
};
