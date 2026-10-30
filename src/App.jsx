import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { DuasScreen, DuaDetailModal } from './screens/duas';
import { FavoritesScreen } from './screens/favorites';
import { SettingsScreen } from './screens/settings';
import { DUAS } from './data/duasData';
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

  // Sync theme attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Persist settings
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    handleUpdateSettings({ ...settings, theme: nextTheme });
    showToast(nextTheme === 'dark' ? 'ഡാർക്ക് മോഡ് സജീവമാക്കി' : 'ലൈറ്റ് മോഡ് സജീവമാക്കി');
  };

  // Toggle Desktop view width
  const handleToggleWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  // Toggle Favorites
  const handleToggleFavorite = (duaId) => {
    let updated;
    const isAlreadyFav = favorites.includes(duaId);
    if (isAlreadyFav) {
      updated = favorites.filter(id => id !== duaId);
      showToast('ഫേവറിറ്റ്സിൽ നിന്ന് നീക്കം ചെയ്തു');
    } else {
      updated = [duaId, ...favorites];
      showToast('ഫേവറിറ്റ്സിൽ ചേർത്തു ❤️');
      audioService.playChime(640, 0.04);
    }
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  // Toggle Bookmarks
  const handleToggleBookmark = (duaId) => {
    let updated;
    const isAlreadyBm = bookmarks.includes(duaId);
    if (isAlreadyBm) {
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
  const currentCategoryDuas = selectedDua
    ? (selectedCategoryId
        ? DUAS.filter(d => d.categoryId === selectedCategoryId)
        : DUAS.filter(d => d.categoryId === selectedDua.categoryId))
    : [];

  return (
    <div className={`device-viewport ${isFullWidth ? 'full-width' : ''}`}>

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
      <main className="app-content" id="main-content" style={{ padding: activeTab === 'duas' ? 0 : undefined }}>
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
            onExploreDuas={() => {
              setSelectedCategoryId(null);
              setActiveTab('duas');
            }}
            settings={settings}
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
            onExploreDuas={() => {
              setSelectedCategoryId(null);
              setActiveTab('duas');
            }}
            settings={settings}
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
      )}

      {/* Toast Notification */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
