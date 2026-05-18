import { describe, it, expect, vi } from 'vitest';
import { fork, allSettled } from 'effector';
import {
  $userProfile,
  setSelectedLanguage,
  setShowFurigana,
  setShowPinyin,
  loadUserProfile,
  type UserProfile,
} from './userProfile';

const DEFAULT: UserProfile = { selectedLanguage: null, showFurigana: true, showPinyin: true };

describe('$userProfile', () => {
  it('initial state matches defaults', () => {
    const scope = fork();
    expect(scope.getState($userProfile)).toEqual(DEFAULT);
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

  it('loadUserProfile in node env (window undefined) returns defaults', async () => {
    const scope = fork();
    await allSettled(loadUserProfile, { scope, params: undefined });
    expect(scope.getState($userProfile)).toEqual(DEFAULT);
  });

  it('loadUserProfile reads from localStorage when window is defined', async () => {
    const stored: UserProfile = { selectedLanguage: 'jp', showFurigana: false, showPinyin: true };
    // window must be truthy to pass the typeof window === 'undefined' guard
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(stored) });

    const scope = fork();
    await allSettled(loadUserProfile, { scope, params: undefined });
    expect(scope.getState($userProfile).selectedLanguage).toBe('jp');
    expect(scope.getState($userProfile).showFurigana).toBe(false);

    vi.unstubAllGlobals();
  });

  it('loadUserProfile merges stored data with defaults (missing fields get defaults)', async () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({ selectedLanguage: 'cn' }),
    });

    const scope = fork();
    await allSettled(loadUserProfile, { scope, params: undefined });
    const state = scope.getState($userProfile);
    expect(state.selectedLanguage).toBe('cn');
    expect(state.showFurigana).toBe(true);
    expect(state.showPinyin).toBe(true);

    vi.unstubAllGlobals();
  });
});
