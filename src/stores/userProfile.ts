import { createStore, createEvent } from 'effector';

export type Language = 'jp' | 'cn';

export interface UserProfile {
  selectedLanguage: Language | null;
}

const defaultProfile: UserProfile = {
  selectedLanguage: null,
};

// Создаем store для профиля пользователя
export const $userProfile = createStore<UserProfile>(defaultProfile);

// Событие для установки выбранного языка
export const setSelectedLanguage = createEvent<Language>();
export const loadUserProfile = createEvent<void>();

// Обновляем store при выборе языка
$userProfile.on(setSelectedLanguage, (state, language) => ({
  ...state,
  selectedLanguage: language,
}));

// Загружаем профиль из localStorage только на клиенте
$userProfile.on(loadUserProfile, () => {
  if (typeof window === 'undefined') {
    return defaultProfile;
  }

  const stored = localStorage.getItem('userProfile');
  return stored ? JSON.parse(stored) : defaultProfile;
});

// Функция для сохранения в localStorage
const saveToLocalStorage = (profile: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }
};

// Сохраняем в localStorage при изменении
$userProfile.watch(saveToLocalStorage);