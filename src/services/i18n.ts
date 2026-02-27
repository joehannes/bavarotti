export type Language = 'es' | 'en';

const STORAGE_KEY = 'bavarotti-language';

export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'es';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'en' ? 'en' : 'es';
};

export const setStoredLanguage = (language: Language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, language);
  }
};
