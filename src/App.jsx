import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import SplashScreen from './components/SplashScreen';
import { DuasScreen, DuaDetailModal, CategoryDuaReader } from './screens/duas';
import { FavoritesScreen } from './screens/favorites';
import { SettingsScreen } from './screens/settings';
import { DUAS } from './data/duasData';
import { CATEGORIES_DATA } from './data/categoriesData';
import { 
  getStoredFavorites, 
  saveStoredFavorites, 
  getStoredBookmarks,
  saveStoredBookmarks,
  getStoredSettings, 
  saveStoredSettings,
  addStoredRecent
} from './utils/storage';
import { audioService } from './utils/audioService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('duas'); // 'duas' | 'favorites' | 'bookmarks' | 'settings'
  const [selectedDua, setSelectedDua] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [favorites, setFavorites] = useState(() => getStoredFavorites());
  const [bookmarks, setBookmarks] = useState(() => getStoredBookmarks());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [theme, setTheme] = useState(() => getStoredSettings().theme || 'light');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [audioState, setAudioState] = useState(audioService.getState());

  // Listen to audio service state
  useEffect(() => {
    const unsub = audioService.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsub;
  }, []);

  // Sync theme attribute on document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle Theme (Light / Dark)
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const updatedSettings = { ...settings, theme: newTheme };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    showToast(newTheme === 'dark' ? 'ഡാർക്ക് മോഡ് ഓണാക്കി 🌙' : 'ലൈറ്റ് മോഡ് ഓണാക്കി ☀️');
  };

  // Toggle Responsive Width (Mobile viewport 440px vs Full Desktop Width)
  const handleToggleWidth = () => {
    setIsFullWidth(prev => !prev);
    showToast(isFullWidth ? 'മൊബൈൽ വ്യൂവിലേക്ക് മാറ്റി' : 'ഫുൾ വിഡ്ത് വ്യൂവിലേക്ക് മാറ്റി');
  };

  // Update Settings
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    if (newSettings.theme && newSettings.theme !== theme) {
      setTheme(newSettings.theme);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (duaId) => {
    let updated;
    if (favorites.includes(duaId)) {
      updated = favorites.filter(id => id !== duaId);
      showToast('പ്രിയപ്പെട്ടവയിൽ നിന്ന് നീക്കം ചെയ്തു');
    } else {
      updated = [duaId, ...favorites];
      showToast('പ്രിയപ്പെട്ടവയിൽ ചേർത്തു ❤️');
      audioService.playChime(520, 0.04);
    }
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (duaId) => {
    let updated;
    if (bookmarks.includes(duaId)) {
      updated = bookmarks.filter(id => id !== duaId);
      showToast('ബുക്ക്മാർക്കിൽ നിന്ന് നീക്കം ചെയ്തു');
    } else {
      updated = [duaId, ...bookmarks];
      showToast('ബുക്ക്മാർക്കിൽ ചേർത്തു 🔖');
      audioService.playChime(640, 0.04);
    }
    setBookmarks(updated);
    saveStoredBookmarks(updated);
  };

  // Select Dua to open dedicated page
  const handleSelectDua = (dua) => {
    setSelectedDua(dua);
    addStoredRecent(dua.id);
  };

  // Toggle audio playback
  const handleTogglePlay = (dua) => {
    if (!dua.audioUrl) {
      showToast('ഈ ദുആയ്ക്കുള്ള യഥാർത്ഥ സ്റ്റുഡിയോ ഓഡിയോ ഉടൻ ലഭ്യമാകും');
      return;
    }
    if (audioState.isPlaying && audioState.currentDuaId === dua.id) {
      audioService.pause();
    } else {
      audioService.playDua(dua, settings.audioSpeed || 1.0, settings.autoReplay);
    }
  };

  // Toast helper
  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2200);
  };

  // Category duas for currently selected dua (used for pagination 1/10.. 10/10)
  const currentCategoryDuas = selectedDua ? (selectedDua.subCategoryId ? DUAS.filter(d => d.subCategoryId === selectedDua.subCategoryId) : (selectedCategoryId ? DUAS.filter(d => d.categoryId === selectedCategoryId) : DUAS.filter(d => d.categoryId === selectedDua.categoryId))) : [];

  return (
    <div className={`device-viewport ${isFullWidth ? 'full-width' : ''}`}>
      {/* Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Main App Header (rendered on Favorites, Bookmarks, and Settings tabs) */}
      {activeTab !== 'duas' && (
        <Header 
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isFullWidth={isFullWidth}
          onToggleWidth={handleToggleWidth}
          activeTab={activeTab}
          language={settings.language}
        />
      )}

      {/* Main Content Area based on Active Tab */}
      <main 
        className="app-content" 
        id="main-content" 
        style={{ 
          padding: activeTab === 'duas' ? 0 : undefined,
          overflow: (activeTab === 'duas' && selectedCategoryId === 'prayer') ? 'hidden' : undefined
        }}
      >
        {/* Tab 1: Duas (Home & Category List screens matching Screen 1 & 2) */}
        {activeTab === 'duas' && (
          <DuasScreen 
            duas={DUAS}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            favorites={favorites}
            playingDuaId={audioState.isPlaying ? audioState.currentDuaId : null}
            onToggleFavorite={handleToggleFavorite}
            onTogglePlay={handleTogglePlay}
            onSelectDua={handleSelectDua}
            settings={settings}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 2: Favorites (പ്രിയപ്പെട്ടവ) */}
        {activeTab === 'favorites' && (
          <FavoritesScreen 
            duas={DUAS}
            favorites={favorites}
            playingDuaId={audioState.isPlaying ? audioState.currentDuaId : null}
            onToggleFavorite={handleToggleFavorite}
            onTogglePlay={handleTogglePlay}
            onSelectDua={handleSelectDua}
            language={settings.language}
          />
        )}

        {/* Tab 3: Bookmarks (ബുക്ക്മാർക്ക്) */}
        {activeTab === 'bookmarks' && (
          <FavoritesScreen 
            duas={DUAS}
            favorites={bookmarks}
            playingDuaId={audioState.isPlaying ? audioState.currentDuaId : null}
            onToggleFavorite={handleToggleBookmark}
            onTogglePlay={handleTogglePlay}
            onSelectDua={handleSelectDua}
            language={settings.language}
            isBookmarkView={true}
          />
        )}

        {/* Tab 4: Settings (കൂടുതൽ) */}
        {activeTab === 'settings' && (
          <SettingsScreen 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onShowToast={showToast}
            totalDuasCount={DUAS.length}
            onShowSplash={() => setShowSplash(true)}
          />
        )}
      </main>

      {/* Bottom Navigation (ഹോം, പ്രിയപ്പെട്ടവ, ബുക്ക്മാർക്ക്, കൂടുതൽ) */}
      <BottomNav 
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'duas') {
            setSelectedCategoryId(null);
          }
          setActiveTab(tab);
        }}
        favoritesCount={favorites.length}
        language={settings.language}
      />

      {/* Full Dedicated Dua Detail Page (matching Screens 3, 4, 5, 6) */}
      {selectedDua && (
        ['prayer-34', 'prayer-35', 'prayer-36', 'prayer-37', 'prayer-39', 'prayer-1', 'prayer-2'].includes(selectedDua.id) || 
        ['prayer-40', 'prayer-41', 'prayer-42', 'prayer-43', 'prayer-44', 'prayer-3'].includes(selectedDua.id) ||
        ['prayer-45', 'prayer-46', 'prayer-47', 'prayer-4'].includes(selectedDua.id) ||
        ['prayer-48', 'prayer-49', 'prayer-50', 'prayer-51', 'prayer-52', 'prayer-53', 'prayer-54', 'prayer-5'].includes(selectedDua.id) ||
        ['prayer-55', 'prayer-56', 'prayer-6'].includes(selectedDua.id) ||
        ['prayer-57', 'prayer-58', 'prayer-7'].includes(selectedDua.id) ||
        ['prayer-59', 'prayer-60', 'prayer-8'].includes(selectedDua.id) ||
        ['prayer-61', 'prayer-62', 'prayer-9'].includes(selectedDua.id) ||
        ['prayer-63', 'prayer-64', 'prayer-65', 'prayer-66', 'prayer-67', 'prayer-68', 'prayer-69', 'prayer-70', 'prayer-71', 'prayer-72', 'prayer-73', 'prayer-10'].includes(selectedDua.id) ||
        [34, 35, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73].includes(selectedDua.originalId) ? (
          (() => {
            const prayerCategory = CATEGORIES_DATA.find(c => c.originalId === 2 || c.name.includes('നമസ്കാരം')) || CATEGORIES_DATA[0];
            return (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                <CategoryDuaReader 
                  initialView="reading"
                  initialCategory={prayerCategory}
                  initialSubcategory={
                    [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73].includes(selectedDua.originalId) || ['prayer-63', 'prayer-64', 'prayer-65', 'prayer-66', 'prayer-67', 'prayer-68', 'prayer-69', 'prayer-70', 'prayer-71', 'prayer-72', 'prayer-73', 'prayer-10'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[8] // sub_9: സലാം വീട്ടുന്നതിനു മുമ്പുള്ള പ്രാർത്ഥനകൾ
                      : [61, 62].includes(selectedDua.originalId) || ['prayer-61', 'prayer-62', 'prayer-9'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[7] // sub_8: അത്തഹിയാത്തിനു ശേഷം സ്വലാത്ത്
                      : [59, 60].includes(selectedDua.originalId) || ['prayer-59', 'prayer-60', 'prayer-8'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[6] // sub_7: അത്തഹിയാത്ത്
                      : [57, 58].includes(selectedDua.originalId) || ['prayer-57', 'prayer-58', 'prayer-7'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[5] // sub_6: ഖുർആൻ പാരായണ സുജൂദിലെ പ്രാർത്ഥന
                      : [55, 56].includes(selectedDua.originalId) || ['prayer-55', 'prayer-56', 'prayer-6'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[4] // sub_5: രണ്ട് സുജൂദുകൾക്കിടയിലെ പ്രാർത്ഥന
                      : [48, 49, 50, 51, 52, 53, 54].includes(selectedDua.originalId) || ['prayer-48', 'prayer-49', 'prayer-50', 'prayer-51', 'prayer-52', 'prayer-53', 'prayer-54', 'prayer-5'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[3] // sub_4: സുജൂദിലെ പ്രാർത്ഥനകൾ
                      : [45, 46, 47].includes(selectedDua.originalId) || ['prayer-45', 'prayer-46', 'prayer-47', 'prayer-4'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[2] // sub_3: റുകൂഹിൽ നിന്നും ഉയരുമ്പോൾ
                      : [40, 41, 42, 43, 44].includes(selectedDua.originalId) || ['prayer-40', 'prayer-41', 'prayer-42', 'prayer-43', 'prayer-44', 'prayer-3'].includes(selectedDua.id)
                      ? prayerCategory.subcategories[1] // sub_2: റുകൂഹിലെ പ്രാർത്ഥന
                      : prayerCategory.subcategories[0] // sub_1: പ്രാരംഭ പ്രാർത്ഥന
                  }
                  initialIndex={(() => {
                    const map = { 
                      'prayer-34': 0, 'prayer-1': 0, 'prayer-35': 1, 'prayer-2': 1, 'prayer-36': 2, 'prayer-37': 3, 'prayer-39': 4,
                      'prayer-40': 0, 'prayer-3': 0, 'prayer-41': 1, 'prayer-42': 2, 'prayer-43': 3, 'prayer-44': 4,
                      'prayer-45': 0, 'prayer-46': 1, 'prayer-4': 1, 'prayer-47': 2,
                      'prayer-48': 0, 'prayer-5': 0, 'prayer-49': 1, 'prayer-50': 2, 'prayer-51': 3, 'prayer-52': 4, 'prayer-53': 5, 'prayer-54': 6,
                      'prayer-55': 0, 'prayer-6': 0, 'prayer-56': 1,
                      'prayer-57': 0, 'prayer-7': 0, 'prayer-58': 1,
                      'prayer-59': 0, 'prayer-8': 0, 'prayer-60': 1,
                      'prayer-61': 0, 'prayer-9': 0, 'prayer-62': 1,
                      'prayer-63': 0, 'prayer-10': 0, 'prayer-64': 1, 'prayer-65': 2, 'prayer-66': 3, 'prayer-67': 4, 'prayer-68': 5, 'prayer-69': 6, 'prayer-70': 7, 'prayer-71': 8, 'prayer-72': 9, 'prayer-73': 10
                    };
                    if (selectedDua.originalId) {
                      if ([34, 40, 45, 48, 55, 57, 59, 61, 63].includes(selectedDua.originalId)) return 0;
                      if ([35, 41, 46, 49, 56, 58, 60, 62, 64].includes(selectedDua.originalId)) return 1;
                      if ([36, 42, 47, 50, 65].includes(selectedDua.originalId)) return 2;
                      if ([37, 43, 51, 66].includes(selectedDua.originalId)) return 3;
                      if ([39, 44, 52, 67].includes(selectedDua.originalId)) return 4;
                      if ([53, 68].includes(selectedDua.originalId)) return 5;
                      if ([54, 69].includes(selectedDua.originalId)) return 6;
                      if (selectedDua.originalId === 70) return 7;
                      if (selectedDua.originalId === 71) return 8;
                      if (selectedDua.originalId === 72) return 9;
                      if (selectedDua.originalId === 73) return 10;
                    }
                    return map[selectedDua.id] ?? 0;
                  })()}
                  onBackToHome={() => setSelectedDua(null)}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            );
          })()) : (
          <DuaDetailModal 
            dua={selectedDua}
            categoryDuas={currentCategoryDuas}
            isFavorite={favorites.includes(selectedDua.id)}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setSelectedDua(null)}
            onSelectDua={handleSelectDua}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )
      )}

      {/* Toast Notification */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
