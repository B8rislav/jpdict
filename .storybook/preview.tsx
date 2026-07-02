import type { Preview } from '@storybook/nextjs-vite';
import RootLayout from '../src/app/layout';
import { startMockWorker } from '../src/mocks/browser';

const preview: Preview = {
  parameters: {},
  // Start the MSW browser worker once, reusing src/mocks/handlers. Resilient: if the
  // service worker can't register (headless test runner), it no-ops rather than failing.
  beforeAll: async () => {
    await startMockWorker();
  },
  decorators: [
    (Story) => (
      <RootLayout>
        <Story />
      </RootLayout>
    ),
  ],
};

export default preview;
