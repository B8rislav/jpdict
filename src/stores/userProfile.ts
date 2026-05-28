import { createStore, createEvent } from 'effector';
import { type Language } from '@/shared/api/types';
import { setLocale, type Locale } from '@/shared/i18n';

export interface UserProfile {
  selectedLanguage: Language | null;
  showFurigana: boolean;
  showPinyin: boolean;
  uiLocale: Locale;
}

const defaultProfile: UserProfile = {
  selectedLanguage: null,
  showFurigana: true,
  showPinyin: true,
  uiLocale: 'ru',
};

export const $userProfile = createStore<UserProfile>(defaultProfile);

export const setSelectedLanguage = createEvent<Language>();
export const setShowFurigana = createEvent<boolean>();
export const setShowPinyin = createEvent<boolean>();
export const setUiLocale = createEvent<Locale>();
export const loadUserProfile = createEvent<void>();

$userProfile.on(setSelectedLanguage, (state, language) => ({
  ...state,
  selectedLanguage: language,
}));

$userProfile.on(setShowFurigana, (state, showFurigana) => ({
  ...state,
  showFurigana,
}));

$userProfile.on(setShowPinyin, (state, showPinyin) => ({
  ...state,
  showPinyin,
}));

$userProfile.on(setUiLocale, (state, uiLocale) => ({
  ...state,
  uiLocale,
}));

$userProfile.on(loadUserProfile, () => {
  if (typeof window === 'undefined') {
    return defaultProfile;
  }

  const stored = localStorage.getItem('userProfile');
  return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
});

const saveToLocalStorage = (profile: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }
};

$userProfile.updates.watch(saveToLocalStorage);

$userProfile.watch(profile => {
  setLocale(profile.uiLocale);
});

export const $uiLocale = $userProfile.map(p => p.uiLocale);
