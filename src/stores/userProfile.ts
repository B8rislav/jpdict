import { createStore, createEvent } from 'effector';
import { type Language } from '@/shared/api/types';

export interface UserProfile {
  selectedLanguage: Language | null;
  showFurigana: boolean;
  showPinyin: boolean;
}

const defaultProfile: UserProfile = {
  selectedLanguage: null,
  showFurigana: true,
  showPinyin: true,
};

// Создаем store для профиля пользователя
export const $userProfile = createStore<UserProfile>(defaultProfile);

// Событие для установки выбранного языка
export const setSelectedLanguage = createEvent<Language>();
export const setShowFurigana = createEvent<boolean>();
export const setShowPinyin = createEvent<boolean>();
export const loadUserProfile = createEvent<void>();

// Обновляем store при выборе языка
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

// Загружаем профиль из localStorage только на клиенте
$userProfile.on(loadUserProfile, () => {
  if (typeof window === 'undefined') {
    return defaultProfile;
  }

  const stored = localStorage.getItem('userProfile');
  return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
});

// Функция для сохранения в localStorage
const saveToLocalStorage = (profile: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }
};

// Сохраняем в localStorage при изменении (только при обновлении, не при инициализации)
$userProfile.updates.watch(saveToLocalStorage);
