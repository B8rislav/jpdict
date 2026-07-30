import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { AppNavView } from './AppNavView';

const meta: Meta<typeof AppNavView> = {
  title: 'features/AppNavView',
  component: AppNavView,
  decorators: [
    (Story) => (
      <div style={{ width: 1100, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    selectedLanguage: 'jp',
    uiLocale: 'ru',
    showFurigana: true,
    showPinyin: true,
    isAuthenticated: false,
    userLabel: null,
    onSelectLanguage: fn(),
    onSelectLocale: fn(),
    onToggleFurigana: fn(),
    onTogglePinyin: fn(),
    onSignIn: fn(),
    onSignOut: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AppNavView>;

/** Signed out: only the login button, no dictionary/study links. */
export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: { isAuthenticated: true, userLabel: 'Mock User' },
};

/** Falls back to the email when the account has no display name. */
export const SignedInWithoutName: Story = {
  args: { isAuthenticated: true, userLabel: 'mock@user.dev' },
};

/** Japanese exposes the furigana toggle. */
export const JapaneseSelected: Story = {
  args: { selectedLanguage: 'jp', isAuthenticated: true, userLabel: 'Mock User' },
};

/** Chinese swaps it for pinyin. */
export const ChineseSelected: Story = {
  args: { selectedLanguage: 'cn', isAuthenticated: true, userLabel: 'Mock User' },
};

/** English UI — the locale pill moves and every label switches. */
export const EnglishLocale: Story = {
  args: { uiLocale: 'en', isAuthenticated: true, userLabel: 'Mock User' },
};

/** No language chosen yet: neither pill is active. */
export const NoLanguageSelected: Story = {
  args: { selectedLanguage: null },
};
