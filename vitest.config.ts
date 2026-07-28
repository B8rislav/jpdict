import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          globals: true,
        },
        resolve: {
          alias: { '@': path.join(dirname, 'src') },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        optimizeDeps: {
          include: [
            '@storybook/addon-a11y/preview',
            '@storybook/nextjs-vite',
            'effector-react',
            'react',
            '@gravity-ui/uikit',
            'effector',
            'motion/react',
            'storybook/test',
            'designoslav',
          ],
          // designoslav ships raw .tsx using the automatic JSX runtime (no
          // `import React`). Pre-bundle it with the automatic transform so its
          // components don't reference an undefined `React` in the browser tests.
          esbuildOptions: { jsx: 'automatic' },
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
