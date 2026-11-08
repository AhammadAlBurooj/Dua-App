import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bookmark, 
  Play, 
  Pause, 
  Sparkles, 
  Moon, 
  Sun,
  Copy,
  Share2,
  BookOpen,
  ChevronRight,
  Check,
  ArrowLeft
} from 'lucide-react';
import './FavoritesScreen.css';

/**
 * Categorize a Dua into Morning, Evening, Before Sleep, Prayer, etc.
 */
function getDuaCategoryInfo(dua, isEnglish = false) {
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
    return { key: 'evening', badge: isEnglish ? 'EVENING' : 'സായാഹ്നം' };
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
  const raw = dua.subCategoryTitle || dua.categoryTitle || (isEnglish ? 'DUA' : 'പ്രാർത്ഥന');
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
  onBack,
  language = 'ml',
  theme = 'light',
  onToggleTheme,
  isBookmarkView = false
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const isEnglish = language === 'en';

  // Find user's favorite duas strictly based on valid matching Duas
  const favoriteDuas = useMemo(() => {
    if (!Array.isArray(favorites) || favorites.length === 0) return [];

    const matched = (duas || []).filter(d => {
      const dId = String(d.id);
      const dOrig = d.originalId !== undefined ? String(d.originalId) : null;
      return favorites.some(f => {
        if (!f) return false;
        const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
        return fId === dId || (dOrig && fId === dOrig);
      });
    });

    // Deduplicate strictly by unique dua identity
    const seen = new Set();
    return matched.filter(d => {
      const key = d.originalId !== undefined ? `orig-${d.originalId}` : `id-${d.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [duas, favorites]);

  // Dynamic category filter pills: only include categories that actually have bookmarked items
  const filterPills = useMemo(() => {
    if (!favoriteDuas || favoriteDuas.length === 0) return [];

    const categoryMap = {
      morning: isEnglish ? 'Morning' : 'പ്രഭാതം',
      evening: isEnglish ? 'Evening' : 'സായാഹ്നം',
      sleep: isEnglish ? 'Before Sleep' : 'ഉറക്കം',
      prayer: isEnglish ? 'Prayer' : 'നമസ്കാരം',
      mosque: isEnglish ? 'Mosque' : 'പള്ളി',
      food: isEnglish ? 'Food' : 'ഭക്ഷണം',
      travel: isEnglish ? 'Travel' : 'യാത്ര',
      forgiveness: isEnglish ? 'Forgiveness' : 'പാപമോചനം',
      general: isEnglish ? 'General' : 'പൊതുവായവ'
    };

    const counts = {};
    const labels = {};

    favoriteDuas.forEach(d => {
      const info = getDuaCategoryInfo(d, isEnglish);
      const k = info.key;
      counts[k] = (counts[k] || 0) + 1;
      if (!labels[k]) {
        labels[k] = categoryMap[k] || info.badge || (isEnglish ? 'General' : 'പ്രാർത്ഥനകൾ');
      }
    });

    const activeKeys = Object.keys(counts).filter(k => counts[k] > 0);

    // If 0 or only 1 category exists, no category filter tabs needed
    if (activeKeys.length <= 1) return [];

    // If 2 or more categories have bookmarked items, show 'All' and only non-empty categories
    const pills = [
      { id: 'all', label: isEnglish ? 'All' : 'All' }
    ];

    activeKeys.forEach(k => {
      pills.push({
        id: k,
        label: `${labels[k]} (${counts[k]})`
      });
    });

    return pills;
  }, [favoriteDuas, isEnglish]);

  // If selected filter is no longer in active pills, reset to 'all'
  useEffect(() => {
    if (selectedFilter !== 'all') {
      const exists = filterPills.some(p => p.id === selectedFilter);
      if (!exists) {
        setSelectedFilter('all');
      }
    }
  }, [filterPills, selectedFilter]);

  // Filtered duas according to active pill
  const filteredDuas = useMemo(() => {
    if (selectedFilter === 'all') return favoriteDuas;
    const filtered = favoriteDuas.filter(d => {
      const info = getDuaCategoryInfo(d, isEnglish);
      return info.key === selectedFilter;
    });
    return filtered.length > 0 ? filtered : favoriteDuas;
  }, [favoriteDuas, selectedFilter, isEnglish]);

  const handleCopyDua = (e, dua) => {
    e.stopPropagation();
    const parts = [
      dua.arabic,
      dua.meaningMl || dua.meaningEn,
      dua.reference
    ].filter(Boolean);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(parts.join('\n\n'));
    }
    setCopiedId(dua.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleShareDua = async (e, dua) => {
    e.stopPropagation();
    const parts = [
      dua.arabic,
      dua.meaningMl || dua.meaningEn,
      dua.reference
    ].filter(Boolean);

    const shareText = parts.join('\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: dua.titleMl || dua.titleEn || 'Dua',
          text: shareText
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyDua(e, dua);
    }
  };

  return (
    <div className="fav-glass-root">
      {/* Animated Aurora Background Blobs */}
      <div className="fav-aurora-blob fav-aurora-blob-1"></div>
      <div className="fav-aurora-blob fav-aurora-blob-2"></div>
      <div className="fav-aurora-blob fav-aurora-blob-3"></div>

      {/* ════════════════════════════════════════════════════════════
          CLASSIC NEAT & CLEAN GLASSMORPHIC TOP BAR
          ════════════════════════════════════════════════════════════ */}
      <header className="fav-glass-nav">
        <div className="fav-glass-nav-inner">
          <div className="fav-glass-nav-left">
            <button 
              type="button"
              className="fav-glass-back-btn"
              onClick={() => {
                if (onBack) onBack();
                else if (onExploreDuas) onExploreDuas();
              }}
              title={isEnglish ? "Back to Home" : "Back to Home"}
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>

            <div className="fav-glass-nav-titles">
              <h1 className="fav-glass-nav-title">
                {isBookmarkView 
                  ? (isEnglish ? 'Bookmarks' : 'ബുക്ക്മാർക്കുകൾ') 
                  : (isEnglish ? 'Favorites' : 'Favourites')}
              </h1>
              <p className="fav-glass-nav-subtitle">
                {isBookmarkView 
                  ? (isEnglish ? 'Your saved bookmarks' : 'Your saved bookmarks')
                  : (isEnglish ? 'Your saved Duas & Adhkar' : 'Your saved Duas & Adhkar')}
              </p>
            </div>
          </div>

          <div className="fav-glass-nav-right">
            {/* {favoriteDuas.length > 0 && (
              <span className="fav-count-pill">
                <Sparkles size={13} className="fav-sparkle-dot" />
                <span>
                  {favoriteDuas.length} {isEnglish ? 'Duas' : 'ദുആകൾ'}
                </span>
              </span>
            )} */}
            {onToggleTheme && (
              <button 
                className="fav-glass-theme-btn"
                onClick={onToggleTheme}
                title={theme === 'dark' ? "Light mode" : "Dark mode"}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="fav-glass-content">
        {/* ════════════════════════════════════════════════════════════
            CATEGORY FILTER CAPSULES (Only if multiple categories exist)
            ════════════════════════════════════════════════════════════ */}
        {filterPills.length > 0 && (
          <div className="fav-pills-glass-wrapper">
            <div className="fav-pills-glass-bar fav-no-scrollbar" role="tablist" aria-label="Favorites Categories">
              {filterPills.map(pill => {
                const isActive = selectedFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`fav-glass-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(pill.id)}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            EMPTY STATE OR GLASSMORPHIC DUA CARDS
            ════════════════════════════════════════════════════════════ */}
        {favoriteDuas.length === 0 ? (
          <div className="fav-empty-glass-container">
            <div className="fav-empty-glass-card">
              <div className="fav-empty-icon-glow-wrap">
                <Bookmark size={42} className="fav-empty-icon-svg" fill="#10B981" color="#10B981" />
              </div>
              <h2 className="fav-empty-glass-title">
                {isBookmarkView 
                  ? (isEnglish ? 'No Bookmarks Yet' : 'No Bookmarks Yet')
                  : (isEnglish ? 'No Favorites Yet' : 'No Favorites Yet')}
              </h2>
              <p className="fav-empty-glass-desc">
                {isBookmarkView 
                  ? (isEnglish ? 'Save your bookmarked Duas here for quick access.' : 'നിങ്ങൾ പിന്നീട് വായിക്കാൻ ആഗ്രഹിക്കുന്ന ദുആകൾ ഇവിടെ ബുക്ക്മാർക്ക് ചെയ്യാം.')
                  : (isEnglish ? 'Save your favorite Duas and Adhkar to find them here easily.' : '')}
              </p>
              {onExploreDuas && (
                <button className="fav-explore-glass-btn" onClick={onExploreDuas}>
                  <Sparkles size={17} />
                  <span>{isEnglish ? 'Explore and Add Duas' : 'Explore and Add Duas'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="fav-cards-grid">
            {filteredDuas.map((dua, index) => {
              const isPlaying = playingDuaId === dua.id || (dua.originalId && playingDuaId === dua.originalId);
              const { badge } = getDuaCategoryInfo(dua, isEnglish);
              const isCopied = copiedId === dua.id;

              return (
                <article 
                  key={dua.id || index} 
                  className="fav-glass-card"
                  onClick={() => onSelectDua && onSelectDua(dua)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Dua #${dua.id}`}
                >
                  <div className="fav-card-shine-top"></div>

                  <div className="fav-card-content-wrap">
                    {/* Top Row: Category Badge & Action Icons */}
                    <div className="fav-card-top-row">
                      <div className="fav-category-glass-pill">
                        <Sparkles size={12} className="fav-category-sparkle" />
                        <span>{badge}</span>
                      </div>

                      <div className="fav-card-actions-cluster" onClick={(e) => e.stopPropagation()}>
                        {/* Audio Play/Pause Button */}
                        {dua.audioUrl && (
                          <button
                            className={`fav-card-action-btn ${isPlaying ? 'playing' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePlay && onTogglePlay(dua);
                            }}
                            title={isPlaying ? "Pause Audio" : "Play Audio"}
                            aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
                          >
                            {isPlaying ? (
                              <Pause size={17} fill="#059669" color="#059669" />
                            ) : (
                              <Play size={17} fill="currentColor" style={{ marginLeft: '1px' }} />
                            )}
                          </button>
                        )}

                        {/* Copy Button */}
                        <button
                          className="fav-card-action-btn"
                          onClick={(e) => handleCopyDua(e, dua)}
                          title="Copy Dua"
                          aria-label="Copy Dua"
                        >
                          {isCopied ? (
                            <Check size={17} className="text-emerald-600" />
                          ) : (
                            <Copy size={17} />
                          )}
                          {isCopied && (
                            <span className="fav-copied-tooltip">
                              Copied!
                            </span>
                          )}
                        </button>

                        {/* Share Button */}
                        <button
                          className="fav-card-action-btn"
                          onClick={(e) => handleShareDua(e, dua)}
                          title="Share Dua"
                          aria-label="Share Dua"
                        >
                          <Share2 size={17} />
                        </button>

                        {/* Bookmarked Icon Button */}
                        <button
                          className="fav-card-action-btn fav-heart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite && onToggleFavorite(dua);
                          }}
                          title="Remove Bookmark"
                          aria-label="Remove Bookmark"
                        >
                          <Bookmark size={18} fill="currentColor" color="#059669" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text with Complete Harakat */}
                    {dua.arabic && (
                      <div className="fav-arabic-wrap">
                        <p className="fav-arabic-text font-arabic" dir="rtl">
                          {dua.arabic}
                        </p>
                      </div>
                    )}

                    {/* Malayalam Meaning */}
                    <p className="fav-meaning-text font-malayalam">
                      {dua.meaningMl || dua.meaningEn || dua.titleMl || ''}
                    </p>

                    {/* Card Footer: Reference & Tap hint */}
                    <div className="fav-card-footer">
                      {dua.reference ? (
                        <div className="fav-ref-pill">
                          <BookOpen size={13} className="fav-ref-icon" />
                          <span>{dua.reference}</span>
                        </div>
                      ) : <div />}

                      <div className="fav-read-hint">
                        <span>{isEnglish ? 'Read More' : 'Read More'}</span>
                        <ChevronRight size={14} className="fav-read-hint-arrow" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
