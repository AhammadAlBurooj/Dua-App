import React, { useState, useEffect, useMemo } from 'react';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import SplashScreen from './components/SplashScreen';
import { DuasScreen, DuaDetailModal, CategoryDuaReader } from './screens/duas';
import { FavoritesScreen } from './screens/favorites';
import { SettingsScreen } from './screens/settings';
import { DUAS } from './data/duasData';
import { CATEGORIES_DATA, ALL_UNIFIED_DUAS } from './data/categoriesData';
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
import { 
  initBackButtonManager, 
  registerBackButtonHandler, 
  registerBackToastCallback 
} from './utils/backButtonManager';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('duas'); // 'duas' | 'favorites' | 'bookmarks' | 'settings'
  const [selectedDua, setSelectedDua] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [favorites, setFavorites] = useState(() => getStoredFavorites());
  const [bookmarks, setBookmarks] = useState(() => getStoredBookmarks());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [theme, setTheme] = useState(() => getStoredSettings().theme || 'light');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [audioState, setAudioState] = useState(audioService.getState());
  const [isReadingActive, setIsReadingActive] = useState(false);

  // Calculate valid favorites count based strictly on existing Duas
  const validFavoritesCount = useMemo(() => {
    if (!Array.isArray(favorites) || favorites.length === 0) return 0;
    const seen = new Set();
    return ALL_UNIFIED_DUAS.filter(d => {
      const dId = String(d.id);
      const dOrig = d.originalId !== undefined ? String(d.originalId) : null;
      const match = favorites.some(f => {
        if (!f) return false;
        const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
        return fId === dId || (dOrig && fId === dOrig);
      });
      if (!match) return false;
      const key = dOrig || dId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).length;
  }, [favorites]);

  // Clean up any stale, orphan or invalid favorite IDs on mount
  useEffect(() => {
    if (Array.isArray(favorites) && favorites.length > 0) {
      const sanitized = favorites.filter(f => {
        if (!f) return false;
        const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
        return ALL_UNIFIED_DUAS.some(d => {
          const dId = String(d.id);
          const dOrig = d.originalId !== undefined ? String(d.originalId) : null;
          return fId === dId || (dOrig && fId === dOrig);
        });
      });
      if (sanitized.length !== favorites.length) {
        setFavorites(sanitized);
        saveStoredFavorites(sanitized);
      }
    }
  }, []);

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

  // Initialize mobile system back button manager
  useEffect(() => {
    initBackButtonManager();
  }, []);

  // Register exit confirmation toast on root Home screen
  useEffect(() => {
    registerBackToastCallback(() => {
      showToast(settings.language === 'en' ? 'Press back again to exit' : 'Press back again to exit');
    });
  }, [settings.language]);

  // Handle back button for selectedDua reader / modal (priority 80)
  useEffect(() => {
    if (!selectedDua) return;
    return registerBackButtonHandler(() => {
      setSelectedDua(null);
      return true;
    }, 80);
  }, [selectedDua]);

  // Handle back button for non-home active tabs (priority 10)
  useEffect(() => {
    if (activeTab === 'duas') return;
    return registerBackButtonHandler(() => {
      setActiveTab('duas');
      return true;
    }, 10);
  }, [activeTab]);

  // Toggle Theme (Light / Dark)
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const updatedSettings = { ...settings, theme: newTheme };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    showToast(newTheme === 'dark' ? 'Dark Mode Enabled' : 'Light Mode Enabled');
  };

  // Update Settings
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    if (newSettings.theme && newSettings.theme !== theme) {
      setTheme(newSettings.theme);
    }
  };

  // Toggle Favorite (handles both object target or string/number ID)
  const handleToggleFavorite = (target) => {
    const targetId = typeof target === 'object' && target !== null ? String(target.id) : String(target);
    const origId = typeof target === 'object' && target !== null && target.originalId !== undefined ? String(target.originalId) : null;

    const exists = favorites.some(f => {
      const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
      return fId === targetId || (origId && fId === origId);
    });

    let updated;
    if (exists) {
      updated = favorites.filter(f => {
        const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
        return fId !== targetId && (origId ? fId !== origId : true);
      });
      showToast('Removed from Bookmarks');
    } else {
      updated = [targetId, ...favorites.filter(f => {
        const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
        return fId !== targetId && (origId ? fId !== origId : true);
      })];
      showToast('Added to Bookmarks');
      audioService.playChime(520, 0.04);
    }
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (target) => {
    const targetId = typeof target === 'object' && target !== null ? String(target.id) : String(target);
    const origId = typeof target === 'object' && target !== null && target.originalId !== undefined ? String(target.originalId) : null;

    const exists = bookmarks.some(b => {
      const bId = typeof b === 'object' && b !== null ? String(b.id) : String(b);
      return bId === targetId || (origId && bId === origId);
    });

    let updated;
    if (exists) {
      updated = bookmarks.filter(b => {
        const bId = typeof b === 'object' && b !== null ? String(b.id) : String(b);
        return bId !== targetId && (origId ? bId !== origId : true);
      });
      showToast(settings.language === 'en' ? 'Removed from bookmarks' : 'ബുക്ക്മാർക്കിൽ നിന്ന് നീക്കം ചെയ്തു');
    } else {
      updated = [targetId, ...bookmarks.filter(b => {
        const bId = typeof b === 'object' && b !== null ? String(b.id) : String(b);
        return bId !== targetId && (origId ? bId !== origId : true);
      })];
      showToast(settings.language === 'en' ? 'Added to bookmarks 🔖' : 'ബുക്ക്മാർക്കിൽ ചേർത്തു 🔖');
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
      showToast(settings.language === 'en' ? 'Authentic studio audio coming soon for this Dua' : 'ഈ ദുആയ്ക്കുള്ള യഥാർത്ഥ സ്റ്റുഡിയോ ഓഡിയോ ഉടൻ ലഭ്യമാകും');
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
    <div className="device-viewport">
      {/* Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Main Content Area based on Active Tab */}
      <main 
        className="app-content" 
        id="main-content" 
        style={{ 
          padding: 0,
          overflow: (activeTab === 'duas' && Boolean(selectedCategoryId)) ? 'hidden' : undefined
        }}
      >
        {/* Tab 1: Duas (Home & Category List screens matching Screen 1 & 2) */}
        {activeTab === 'duas' && (
          <DuasScreen 
            duas={ALL_UNIFIED_DUAS}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            favorites={favorites}
            playingDuaId={audioState.isPlaying ? audioState.currentDuaId : null}
            onToggleFavorite={handleToggleFavorite}
            onTogglePlay={handleTogglePlay}
            onSelectDua={handleSelectDua}
            settings={settings}
            onNavigateTab={setActiveTab}
            onReadingStateChange={setIsReadingActive}
          />
        )}

        {/* Tab 2: Favorites (പ്രിയപ്പെട്ടവ) */}
        {activeTab === 'favorites' && (
          <FavoritesScreen 
            duas={ALL_UNIFIED_DUAS}
            favorites={favorites}
            playingDuaId={audioState.isPlaying ? audioState.currentDuaId : null}
            onToggleFavorite={handleToggleFavorite}
            onTogglePlay={handleTogglePlay}
            onSelectDua={handleSelectDua}
            language={settings.language}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onBack={() => {
              setSelectedCategoryId(null);
              setActiveTab('duas');
            }}
            onExploreDuas={() => {
              setSelectedCategoryId(null);
              setActiveTab('duas');
            }}
          />
        )}

        {/* Tab 3: Bookmarks (ബുക്ക്മാർക്ക്) */}
        {activeTab === 'bookmarks' && (
          <FavoritesScreen 
            duas={ALL_UNIFIED_DUAS}
            favorites={bookmarks}
            playingDuaId={audioState.isPlaying ? audioState.currentDuaId : null}
            onToggleFavorite={handleToggleBookmark}
            onTogglePlay={handleTogglePlay}
            onSelectDua={handleSelectDua}
            language={settings.language}
            isBookmarkView={true}
            onBack={() => {
              setSelectedCategoryId(null);
              setActiveTab('duas');
            }}
            onExploreDuas={() => {
              setSelectedCategoryId(null);
              setActiveTab('duas');
            }}
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

      {/* Bottom Navigation (ഹോം, പ്രിയപ്പെട്ടവ, ബുക്ക്മാർക്ക്, കൂടുതൽ) - Hidden on Dua Reading Page */}
      {!isReadingActive && !selectedDua && (
        <BottomNav 
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'duas') {
              setSelectedCategoryId(null);
            }
            setActiveTab(tab);
          }}
          favoritesCount={validFavoritesCount}
          language={settings.language}
        />
      )}

      {/* Full Dedicated Dua Detail Page (matching Screens 3, 4, 5, 6 or CategoryDuaReader) */}
      {selectedDua && (() => {
        // Look up whether selectedDua belongs to any category in CATEGORIES_DATA
        const dIdStr = String(selectedDua.id);
        const dOrigStr = selectedDua.originalId !== undefined ? String(selectedDua.originalId) : null;

        let foundCat = null;
        let foundSub = null;
        let foundIndex = 0;

        for (const cat of CATEGORIES_DATA) {
          for (const sc of cat.subcategories) {
            const idx = sc.duas.findIndex(d => {
              const curId = String(d.id);
              return curId === dIdStr || (dOrigStr && curId === dOrigStr);
            });
            if (idx !== -1) {
              foundCat = cat;
              foundSub = sc;
              foundIndex = idx;
              break;
            }
          }
          if (foundCat) break;
        }

        if (foundCat && foundSub) {
          return (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
              <CategoryDuaReader 
                initialView="reading"
                initialCategory={foundCat}
                initialSubcategory={foundSub}
                initialIndex={foundIndex}
                onBackToHome={() => setSelectedDua(null)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                settings={settings}
              />
            </div>
          );
        }

        const isFav = favorites.some(f => {
          const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
          return fId === dIdStr || (dOrigStr && fId === dOrigStr);
        });

        return (
          <DuaDetailModal 
            dua={selectedDua}
            categoryDuas={currentCategoryDuas}
            isFavorite={isFav}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setSelectedDua(null)}
            onSelectDua={handleSelectDua}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      })()}

      {/* Toast Notification */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
