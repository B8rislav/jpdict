import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROFILE,
  parseProfileCookie,
  resolveProfile,
  serializeProfileCookie,
  toBackendPatch,
  toCurrentUser,
  type UserProfile,
} from './profile';

const profile: UserProfile = {
  selectedLanguage: 'jp',
  showFurigana: false,
  showPinyin: true,
  uiLocale: 'en',
  dailyGoal: 10,
};

describe('profile cookie', () => {
  it('round-trips', () => {
    expect(parseProfileCookie(serializeProfileCookie(profile))).toEqual(profile);
  });

  it('degrades to null on anything unparseable, so a bad cookie cannot break a render', () => {
    expect(parseProfileCookie(undefined)).toBeNull();
    expect(parseProfileCookie('')).toBeNull();
    expect(parseProfileCookie('not json')).toBeNull();
    expect(parseProfileCookie('"a string"')).toBeNull();
    expect(parseProfileCookie('null')).toBeNull();
  });

  it('drops fields with unexpected values instead of trusting them', () => {
    const parsed = parseProfileCookie(
      JSON.stringify({ selectedLanguage: 'fr', uiLocale: 'de', showFurigana: 'yes' }),
    );
    expect(parsed).toEqual({});
  });

  it('keeps the valid fields of a partially-corrupt cookie', () => {
    const parsed = parseProfileCookie(
      JSON.stringify({ selectedLanguage: 'cn', uiLocale: 'klingon' }),
    );
    expect(parsed).toEqual({ selectedLanguage: 'cn' });
  });
});

describe('resolveProfile', () => {
  it('prefers the cookie over the browser language', () => {
    const resolved = resolveProfile({
      cookie: { uiLocale: 'ru' },
      acceptLanguageLocale: 'en',
    });
    expect(resolved.uiLocale).toBe('ru');
  });

  it('uses the browser language only when no preference is stored', () => {
    expect(resolveProfile({ cookie: null, acceptLanguageLocale: 'en' }).uiLocale).toBe('en');
  });

  it('falls back to defaults with nothing to go on', () => {
    expect(resolveProfile({})).toEqual(DEFAULT_PROFILE);
  });

  it('fills each field independently from a partial cookie', () => {
    const resolved = resolveProfile({
      cookie: { selectedLanguage: 'cn' },
      acceptLanguageLocale: 'en',
    });
    expect(resolved.selectedLanguage).toBe('cn');
    expect(resolved.uiLocale).toBe('en');
    expect(resolved.showFurigana).toBe(DEFAULT_PROFILE.showFurigana);
  });
});

describe('backend translation', () => {
  it('maps a backend user to the frontend shape', () => {
    expect(
      toCurrentUser({
        id: 'u1',
        email: 'a@b.com',
        name: 'Bo',
        language: 'cn',
        ui_locale: 'en',
        show_furigana: false,
        show_pinyin: true,
        daily_goal: 10,
      }),
    ).toEqual({
      dailyGoal: 10,
      id: 'u1',
      email: 'a@b.com',
      name: 'Bo',
      selectedLanguage: 'cn',
      uiLocale: 'en',
      showFurigana: false,
      showPinyin: true,
    });
  });

  it('omits absent fields so a PATCH never overwrites what it did not mean to', () => {
    expect(toBackendPatch({ uiLocale: 'en' })).toEqual({ ui_locale: 'en' });
  });

  it('keeps explicit false values, which are meaningful and not "absent"', () => {
    expect(toBackendPatch({ showFurigana: false })).toEqual({ show_furigana: false });
  });
});
