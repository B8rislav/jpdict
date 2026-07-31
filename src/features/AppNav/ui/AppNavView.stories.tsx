import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { AppNavView } from './AppNavView';

const meta: Meta<typeof AppNavView> = {
  title: 'features/AppNavView',
  component: AppNavView,
  parameters: { layout: 'fullscreen' },
  args: {
    selectedLanguage: 'jp',
    isAuthenticated: false,
    pathname: '/',
    onSelectLanguage: fn(),
    onSignIn: fn(),
    onSignOut: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AppNavView>;

/** Signed out: only Разбор and the login button — the gated destinations are absent. */
export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: { isAuthenticated: true },
};

/** On /dictionary the active underline moves off Разбор. */
export const OnDictionary: Story = {
  args: { isAuthenticated: true, pathname: '/dictionary' },
};

export const OnStudy: Story = {
  args: { isAuthenticated: true, pathname: '/study' },
};

/** Chinese selected — the segmented control flips to 中文. */
export const ChineseSelected: Story = {
  args: { selectedLanguage: 'cn', isAuthenticated: true },
};

/** No language chosen yet: neither segment reads as active. */
export const NoLanguageSelected: Story = {
  args: { selectedLanguage: null },
};
