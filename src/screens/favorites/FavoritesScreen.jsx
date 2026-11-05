import React, { useState, useMemo } from 'react';
import { Bookmark, Play, Pause, Heart, Sparkles, Moon, Sun } from 'lucide-react';
import './FavoritesScreen.css';

/**
 * Categorize a Dua into Morning, Evening, Before Sleep, Prayer, or custom tag.
 */
function getDuaCategoryInfo(dua, isEnglish = true) {
  const cat = (dua.categoryTitle || dua.category || '').toLowerCase();
  const sub = (dua.subCategoryTitle || dua.subcategory || '').toLowerCase();
  const title = (dua.titleMl || dua.titleEn || '').toLowerCase();
  const desc = (dua.desc || '').toLowerCase();
  const hint = (dua.hint || '').toLowerCase();

  // Morning check
  if (
    sub.includes('രാവിലെ') || cat.includes('രാവിലെ') || title.includes('രാവിലെ') || 
    desc.includes('രാവിലെ') || hint.includes('രാവിലെ') || sub.includes('morning') || cat.includes('morning')
  ) {
    return { key: 'morning', badge: isEnglish ? 'MORNING' : 'പ്രഭാതം' };
  }

  // Evening check
  if (
    sub.includes('വൈകുന്നേരം') || cat.includes('വൈകുന്നേരം') || title.includes('വൈകുന്നേരം') || 
    desc.includes('വൈകുന്നേരം') || hint.includes('വൈകുന്നേരം') || sub.includes('evening') || 
    cat.includes('പ്രദോഷം') || sub.includes('പ്രദോഷം') || cat.includes('evening')
  ) {
    return { key: 'evening', badge: isEnglish ? 'EVENING' : 'പ്രദോഷം' };
  }

  // Sleep check
  if (
    sub.includes('ഉറങ്ങ') || sub.includes('ഉറക്കം') || cat.includes('ഉറക്കം') || 
    title.includes('ഉറങ്ങ') || sub.includes('sleep') || cat.includes('sleep')
  ) {
    return { key: 'sleep', badge: isEnglish ? 'BEFORE SLEEP' : 'ഉറക്കം' };
  }

  // Prayer check
  if (cat.includes('നമസ്കാരം') || sub.includes('നമസ്കാരം') || sub.includes('prayer') || cat.includes('prayer')) {
    return { key: 'prayer', badge: isEnglish ? 'PRAYER' : 'നമസ്കാരം' };
  }

  // Mosque check
  if (cat.includes('പള്ളി') || sub.includes('പള്ളി') || sub.includes('mosque')) {
    return { key: 'mosque', badge: isEnglish ? 'MOSQUE' : 'പള്ളി' };
  }

  // Food check
  if (cat.includes('ഭക്ഷണം') || sub.includes('ഭക്ഷണം') || sub.includes('food')) {
    return { key: 'food', badge: isEnglish ? 'FOOD' : 'ഭക്ഷണം' };
  }

  // Travel check
  if (cat.includes('യാത്ര') || sub.includes('യാത്ര') || sub.includes('travel')) {
    return { key: 'travel', badge: isEnglish ? 'TRAVEL' : 'യാത്ര' };
  }

  // Forgiveness check
  if (cat.includes('പാപമോചനം') || sub.includes('ഇസ്തിഗ്ഫാർ') || sub.includes('forgiveness')) {
    return { key: 'forgiveness', badge: isEnglish ? 'FORGIVENESS' : 'പാപമോചനം' };
  }

  // Default fallback
  const raw = dua.subCategoryTitle || dua.categoryTitle || 'DUA';
  return { key: 'general', badge: raw.toUpperCase() };
}

export default function FavoritesScreen({ 
  duas = [], 
  favorites = [], 
  playingDuaId = null, 
  onToggleFavorite, 
  onTogglePlay, 
  onSelectDua, 
  onExploreDuas,
  language = 'ml',
  theme = 'light',
  onToggleTheme
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const isEnglish = language === 'en';

  // Find user's favorite duas (strictly based on actual saved favorites, never hardcoded)
  const favoriteDuas = useMemo(() => {
    if (!Array.isArray(favorites) || favorites.length === 0) return [];

    return (duas || []).filter(d => {
      const dId = String(d.id);
      const dOrig = d.originalId !== undefined ? String(d.originalId) : null;
      return favorites.some(f => {
        const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
        return fId === dId || 
               (dOrig && fId === dOrig) || 
               fId === `prayer-${dId}` || 
               (dOrig && fId === `prayer-${dOrig}`) ||
               dId === `prayer-${fId}`;
      });
    });
  }, [duas, favorites]);

  // Standard category filter pills matching the reference design
  const filterPills = useMemo(() => {
    const defaultPills = [
      { id: 'all', label: isEnglish ? 'All' : 'All' },
      { id: 'morning', label: isEnglish ? 'Morning' : 'Morning' },
      { id: 'evening', label: isEnglish ? 'Evening' : 'Evening' },
      { id: 'sleep', label: isEnglish ? 'Before Sleep' : 'Before Sleep' }
    ];

    // If favorites contain other categories (e.g. Prayer), append them dynamically
    const otherKeys = new Set();
    favoriteDuas.forEach(d => {
      const info = getDuaCategoryInfo(d, isEnglish);
      if (!['morning', 'evening', 'sleep', 'general'].includes(info.key)) {
        otherKeys.add(JSON.stringify({ id: info.key, label: info.badge }));
      }
    });

    otherKeys.forEach(str => {
      try {
        defaultPills.push(JSON.parse(str));
      } catch {
        // ignore
      }
    });

    return defaultPills;
  }, [favoriteDuas, isEnglish]);

  // Filtered duas according to active pill
  const filteredDuas = useMemo(() => {
    if (selectedFilter === 'all') return favoriteDuas;
    return favoriteDuas.filter(d => {
      const info = getDuaCategoryInfo(d, isEnglish);
      return info.key === selectedFilter;
    });
  }, [favoriteDuas, selectedFilter, isEnglish]);

  return (
    <div className="fav-screen-container">
      {/* 1. Header Section Matching Reference */}
      <div className="fav-header-wrap">
        <div>
          <h1 className="fav-title">Favorites</h1>
          <p className="fav-subtitle">Your saved Duas and Adhkar</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {favoriteDuas.length > 0 && (
            <span className="fav-header-badge">
              {favoriteDuas.length} {isEnglish ? 'saved' : 'സേവ് ചെയ്തു'}
            </span>
          )}
          {onToggleTheme && (
            <button 
              className="fav-action-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? "Light mode" : "Dark mode"}
              aria-label="Toggle Theme"
              style={{ color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="fav-pills-scroll" role="tablist" aria-label="Favorites Categories">
        {filterPills.map(pill => {
          const isActive = selectedFilter === pill.id;
          return (
            <button
              key={pill.id}
              role="tab"
              aria-selected={isActive}
              className={`fav-pill ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedFilter(pill.id)}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 3. Empty State or Dua Cards List */}
      {filteredDuas.length === 0 ? (
        <div className="fav-empty-container">
          <div className="fav-empty-icon-circle">
            <Bookmark size={38} className="fav-empty-bookmark-icon" />
          </div>
          <h3 className="fav-empty-title">No Favorites Yet</h3>
          <p className="fav-empty-desc">
            Save your favorite Duas and Adhkar to find them here easily.
          </p>
          {onExploreDuas && (
            <button className="fav-explore-btn" onClick={onExploreDuas}>
              <Sparkles size={16} />
              <span>{isEnglish ? 'Explore Duas' : 'Explore and Add Duas'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="fav-list">
          {filteredDuas.map(dua => {
            const isPlaying = playingDuaId === dua.id || (dua.originalId && playingDuaId === dua.originalId);
            const { badge } = getDuaCategoryInfo(dua, isEnglish);

            return (
              <div 
                key={dua.id} 
                className="fav-card"
                onClick={() => onSelectDua && onSelectDua(dua)}
                role="article"
                aria-label={`Dua #${dua.id}`}
              >
                {/* Arabic Text */}
                {dua.arabic && (
                  <div className="fav-arabic-wrap">
                    <p className="fav-arabic-text" dir="rtl">
                      {dua.arabic}
                    </p>
                  </div>
                )}

                {/* Malayalam Translation / Meaning */}
                <p className="fav-meaning-text">
                  {dua.meaningMl || dua.meaningEn || dua.titleMl || ''}
                </p>

                {/* Card Footer Divider & Actions */}
                <div className="fav-card-footer">
                  <span className="fav-category-pill">
                    {badge}
                  </span>

                  <div className="fav-card-actions" onClick={(e) => e.stopPropagation()}>
                    {/* Audio Play/Pause Button */}
                    <button
                      className={`fav-action-btn fav-play-btn ${isPlaying ? 'is-playing' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlay && onTogglePlay(dua);
                      }}
                      title={isPlaying ? "Pause Audio" : "Play Audio"}
                      aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
                    >
                      {isPlaying ? (
                        <Pause size={18} fill="#059669" color="#059669" />
                      ) : (
                        <Play size={18} fill="currentColor" />
                      )}
                    </button>

                    {/* Favorite Heart Button (Green filled heart matching reference) */}
                    <button
                      className="fav-action-btn fav-heart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite && onToggleFavorite(dua);
                      }}
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <Heart size={18} fill="#059669" color="#059669" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
