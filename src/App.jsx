import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { DuasScreen, DuaDetailModal } from './screens/duas';
import { FavoritesScreen } from './screens/favorites';
import { SettingsScreen } from './screens/settings';
import { DUAS, DUA_OF_THE_DAY_ID } from './data/duasData';
import { 
  getStoredFavorites, 
  saveStoredFavorites, 
  getStoredSettings, 
  saveStoredSettings,
  addStoredRecent
} from './utils/storage';
import { audioService } from './utils/audioService';

export default function App() {
  const [activeTab, setActiveTab] = useState('duas'); // Default is now the Duas screen
  const [selectedDua, setSelectedDua] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [favorites, setFavorites] = useState(() => getStoredFavorites());
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

  // Select Dua to open details
  const handleSelectDua = (dua) => {
    setSelectedDua(dua);
    addStoredRecent(dua.id);
  };

  // Toggle audio playback
  const handleTogglePlay = (dua) => {
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

  const heroDua = DUAS.find(d => d.id === DUA_OF_THE_DAY_ID) || DUAS[0];

  return (
    <div className={`device-viewport ${isFullWidth ? 'full-width' : ''}`}>
      {/* Native App Status Bar (Simulated clock, wifi, battery) */}
      <div className="app-status-bar">
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="status-bar-icons">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
            <line x1="22" y1="11" x2="22" y2="13"></line>
            <rect x="4" y="9" width="10" height="6" fill="currentColor"></rect>
          </svg>
        </div>
      </div>

      {/* Main App Header */}
      <Header 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isFullWidth={isFullWidth}
        onToggleWidth={handleToggleWidth}
        activeTab={activeTab}
        language={settings.language}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="app-content" id="main-content">
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
            heroDua={heroDua}
            settings={settings}
          />
        )}

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

      {/* Bottom Navigation (Duas, Favorites, Settings) */}
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

      {/* Full Dua Detail Modal */}
      {selectedDua && (
        <DuaDetailModal 
          dua={selectedDua}
          allDuas={DUAS}
          isFavorite={favorites.includes(selectedDua.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedDua(null)}
          onSelectDua={handleSelectDua}
          onShowToast={showToast}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* Toast Notification */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
