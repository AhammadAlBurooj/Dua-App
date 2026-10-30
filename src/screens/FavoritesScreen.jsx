import React, { useState } from 'react';
import { Search, X, Heart, Sparkles, WifiOff } from 'lucide-react';
import DuaCard from '../components/DuaCard';
import { CATEGORIES } from '../data/categories';
import { UI_TEXT } from '../utils/translations';

export default function FavoritesScreen({ 
  duas, 
  favorites, 
  playingDuaId, 
  onToggleFavorite, 
  onTogglePlay, 
  onSelectDua, 
  onExploreDuas,
  settings 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const lang = settings?.language || 'ml';
  const t = UI_TEXT[lang] || UI_TEXT.ml;
  const isEnglish = lang === 'en';

  // Duas that are in favorites
  const favoriteDuas = duas.filter(d => favorites.includes(d.id));

  // Filtered by category and search
  const filteredFavorites = favoriteDuas.filter(d => {
    const matchesCategory = selectedCategoryFilter === 'all' || d.categoryId === selectedCategoryFilter;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return d.titleMl.toLowerCase().includes(q) ||
           d.titleEn.toLowerCase().includes(q) ||
           d.arabic.includes(q) ||
           d.meaningMl.includes(q);
  });

  return (
    <div className="favorites-screen">
      <div style={{ marginBottom: '14px', paddingTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
            {t.favoritesTitle} ({favoriteDuas.length})
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: 600, background: 'var(--bg-sage)', padding: '3px 8px', borderRadius: '12px' }}>
            <WifiOff size={11} />
            <span>{t.offlineAvailable}</span>
          </div>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '2px' }}>
          {t.favoritesSubtitle}
        </p>
      </div>

      {favoriteDuas.length > 0 && (
        <>
          {/* Search inside favorites */}
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon-left" />
            <input 
              type="text" 
              className="search-input"
              placeholder={isEnglish ? "Search in favorites..." : "ഫേവറിറ്റ്സിൽ തിരയുക..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="chips-scroll">
            <button
              className={`chip-btn ${selectedCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategoryFilter('all')}
            >
              {t.allFilter} ({favoriteDuas.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = favoriteDuas.filter(d => d.categoryId === cat.id).length;
              if (count === 0) return null;
              const catTitle = isEnglish ? cat.titleEn : cat.titleMl;
              return (
                <button
                  key={cat.id}
                  className={`chip-btn ${selectedCategoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                >
                  {catTitle} ({count})
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* List or Empty State */}
      {favoriteDuas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-box">
            <Heart size={30} />
          </div>
          <p className="empty-title">{t.noFavoritesTitle}</p>
          <p className="empty-desc">
            {t.noFavoritesDesc}
          </p>
          <button 
            className="hero-play-btn"
            style={{ backgroundColor: 'var(--primary)', color: 'white', marginTop: '8px' }}
            onClick={onExploreDuas}
          >
            <Sparkles size={16} />
            <span>{t.exploreDuasBtn}</span>
          </button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">{t.noDuasFound}</p>
          <p className="empty-desc">{t.noDuasFoundDesc}</p>
        </div>
      ) : (
        filteredFavorites.map(d => (
          <DuaCard 
            key={d.id} 
            dua={d} 
            isFavorite={true}
            isPlaying={playingDuaId === d.id}
            onToggleFavorite={onToggleFavorite}
            onTogglePlay={onTogglePlay}
            onSelectDua={onSelectDua}
            settings={settings}
          />
        ))
      )}
    </div>
  );
}
