const STORAGE_KEYS = {
  FAVORITES: 'dua_app_favorites',
  BOOKMARKS: 'dua_app_bookmarks',
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
    return data ? JSON.parse(data) : ['daily-1', 'daily-3', 'quranic-6'];
  } catch {
    return ['daily-1', 'daily-3', 'quranic-6'];
  }
};

export const saveStoredFavorites = (favs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (err) {
    console.error('Failed to save favorites', err);
  }
};

export const getStoredBookmarks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : ['prayer-2', 'forgiveness-1'];
  } catch {
    return ['prayer-2', 'forgiveness-1'];
  }
};

export const saveStoredBookmarks = (bms) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bms));
  } catch (err) {
    console.error('Failed to save bookmarks', err);
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
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addStoredRecent = (duaId) => {
  try {
    const recents = getStoredRecents();
    const filtered = recents.filter(id => id !== duaId);
    const updated = [duaId, ...filtered].slice(0, 15);
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update recents', err);
  }
};
