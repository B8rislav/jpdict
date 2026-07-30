import type { Preview } from '@storybook/nextjs-vite';

import '../src/app/styles/globals.css';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import 'designoslav/tokens.css';

import { ThemeProvider } from '../src/app/ui/ThemeProvider';
import { startMockWorker } from '../src/mocks/browser';
import { DEFAULT_PROFILE } from '../src/shared/api/profile';
import { DEFAULT_LOCALE, isLocale, LocaleProvider } from '../src/shared/i18n';
import { ProfileProvider } from '../src/shared/profile/context';

/**
 * Stories used to render inside the real `RootLayout`. That stopped being
 * possible once the layout turned async and started reading cookies to resolve
 * the profile — `next/headers` means nothing in a browser. The client-side
 * providers are assembled directly instead, which is also what makes views
 * storyable: `useT()` and `useProfile()` need a provider, not a server request.
 *
 * Both languages are switchable from the toolbar, so a reviewer can check
 * either locale without editing a story.
 */
const preview: Preview = {
  parameters: {},
  globalTypes: {
    locale: {
      description: 'Interface language',
      defaultValue: DEFAULT_LOCALE,
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ru', title: 'Русский' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
    studyLanguage: {
      description: 'Study language',
      defaultValue: 'jp',
      toolbar: {
        icon: 'book',
        items: [
          { value: 'jp', title: '日本語' },
          { value: 'cn', title: '中文' },
        ],
        dynamicTitle: true,
      },
    },
  },
  // Start the MSW browser worker once, reusing src/mocks/handlers. Resilient: if the
  // service worker can't register (headless test runner), it no-ops rather than failing.
  beforeAll: async () => {
    await startMockWorker();
  },
  decorators: [
    (Story, context) => {
      const locale = isLocale(context.globals.locale) ? context.globals.locale : DEFAULT_LOCALE;
      const selectedLanguage = context.globals.studyLanguage === 'cn' ? 'cn' : 'jp';

      return (
        <ProfileProvider profile={{ ...DEFAULT_PROFILE, uiLocale: locale, selectedLanguage }}>
          <LocaleProvider locale={locale}>
            <ThemeProvider>
              <Story />
            </ThemeProvider>
          </LocaleProvider>
        </ProfileProvider>
      );
    },
  ],
};

export default preview;
