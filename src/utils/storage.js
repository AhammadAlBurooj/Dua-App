const STORAGE_KEYS = {
  FAVORITES: 'dua_app_favorites',
  SETTINGS: 'dua_app_settings',
  RECENTS: 'dua_app_recents',
  TASBEEH: 'dua_app_tasbeeh_counts'
};

const DEFAULT_SETTINGS = {
  theme: 'light',
  arabicFontSize: 28,
  showArabic: true,
  showTransliteration: true,
  showMeaningMl: true,
  showMeaningEn: true,
  audioSpeed: 1.0,
  autoReplay: false,
  dailyReminder: true,
  language: 'ml' // 'ml' | 'en'
};

export const getStoredFavorites = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : ['morning-1', 'daily-3', 'protect-4'];
  } catch {
    return ['morning-1', 'daily-3', 'protect-4'];
  }
};

export const saveStoredFavorites = (favs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (err) {
    console.error('Failed to save favorites', err);
  }
};

export const getStoredSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
};

export const getStoredRecents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECENTS);
    return data ? JSON.parse(data) : ['morning-1', 'prayer-1', 'protect-1'];
  } catch {
    return ['morning-1', 'prayer-1', 'protect-1'];
  }
};

export const addStoredRecent = (duaId) => {
  try {
    const recents = getStoredRecents().filter(id => id !== duaId);
    recents.unshift(duaId);
    const trimmed = recents.slice(0, 8);
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [];
  }
};

export const getStoredTasbeehCounts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASBEEH);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveStoredTasbeehCount = (duaId, count) => {
  try {
    const counts = getStoredTasbeehCounts();
    counts[duaId] = count;
    localStorage.setItem(STORAGE_KEYS.TASBEEH, JSON.stringify(counts));
    return counts;
  } catch {
    return {};
  }
};
