import { describe, it, expect } from 'vitest';
import { fork, allSettled } from 'effector';
import { DEFAULT_PROFILE, type UserProfile } from '@/shared/api/profile';
import { fetchCurrentUserFx } from './auth';
import {
  $userProfile,
  profileHydrated,
  setSelectedLanguage,
  setShowFurigana,
  setShowPinyin,
  setUiLocale,
} from './userProfile';

describe('$userProfile', () => {
  it('initial state matches defaults', () => {
    const scope = fork();
    expect(scope.getState($userProfile)).toEqual(DEFAULT_PROFILE);
  });

  it('setSelectedLanguage sets jp', async () => {
    const scope = fork();
    await allSettled(setSelectedLanguage, { scope, params: 'jp' });
    expect(scope.getState($userProfile).selectedLanguage).toBe('jp');
  });

  it('setSelectedLanguage sets cn', async () => {
    const scope = fork();
    await allSettled(setSelectedLanguage, { scope, params: 'cn' });
    expect(scope.getState($userProfile).selectedLanguage).toBe('cn');
  });

  it('switching language preserves other fields', async () => {
    const scope = fork();
    await allSettled(setSelectedLanguage, { scope, params: 'jp' });
    await allSettled(setShowFurigana, { scope, params: false });
    await allSettled(setSelectedLanguage, { scope, params: 'cn' });
    const state = scope.getState($userProfile);
    expect(state.selectedLanguage).toBe('cn');
    expect(state.showFurigana).toBe(false);
  });

  it('setShowFurigana to false', async () => {
    const scope = fork();
    await allSettled(setShowFurigana, { scope, params: false });
    expect(scope.getState($userProfile).showFurigana).toBe(false);
  });

  it('setShowPinyin to false', async () => {
    const scope = fork();
    await allSettled(setShowPinyin, { scope, params: false });
    expect(scope.getState($userProfile).showPinyin).toBe(false);
  });

  it('setUiLocale switches the interface language', async () => {
    const scope = fork();
    await allSettled(setUiLocale, { scope, params: 'en' });
    expect(scope.getState($userProfile).uiLocale).toBe('en');
  });

  describe('hydration', () => {
    it('profileHydrated replaces the whole profile with the server-resolved one', async () => {
      const fromServer: UserProfile = {
        selectedLanguage: 'jp',
        showFurigana: false,
        showPinyin: true,
        uiLocale: 'en',
      };
      const scope = fork();
      await allSettled(profileHydrated, { scope, params: fromServer });
      expect(scope.getState($userProfile)).toEqual(fromServer);
    });
  });

  describe('DB precedence', () => {
    it("a signed-in user's stored profile overrides what the cookie hydrated", async () => {
      const scope = fork({
        handlers: [
          [
            fetchCurrentUserFx,
            async () => ({
              id: 'u1',
              email: 'a@b.com',
              name: null,
              selectedLanguage: 'cn' as const,
              showFurigana: false,
              showPinyin: false,
              uiLocale: 'en' as const,
            }),
          ],
        ],
      });

      // This device's cookie said Japanese/Russian…
      await allSettled(profileHydrated, {
        scope,
        params: { selectedLanguage: 'jp', showFurigana: true, showPinyin: true, uiLocale: 'ru' },
      });
      // …but the account says Chinese/English, and the account wins.
      await allSettled(fetchCurrentUserFx, { scope });

      const state = scope.getState($userProfile);
      expect(state.selectedLanguage).toBe('cn');
      expect(state.uiLocale).toBe('en');
      expect(state.showFurigana).toBe(false);
    });

    it('a signed-out lookup leaves the hydrated profile alone', async () => {
      const scope = fork({ handlers: [[fetchCurrentUserFx, async () => null]] });

      await allSettled(profileHydrated, {
        scope,
        params: { selectedLanguage: 'jp', showFurigana: false, showPinyin: true, uiLocale: 'en' },
      });
      await allSettled(fetchCurrentUserFx, { scope });

      const state = scope.getState($userProfile);
      expect(state.selectedLanguage).toBe('jp');
      expect(state.uiLocale).toBe('en');
      expect(state.showFurigana).toBe(false);
    });
  });
});
