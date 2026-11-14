import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  X, 
  ArrowLeft, 
  SunMedium, 
  Sunrise, 
  Moon, 
  Sparkles, 
  Users, 
  Compass, 
  ShieldCheck, 
  HeartHandshake, 
  HeartPulse, 
  LifeBuoy, 
  Utensils, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  Heart,
  Folder,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CATEGORIES_DATA, CATEGORY_THEMES } from '../../data/categoriesData';
import { registerBackButtonHandler } from '../../utils/backButtonManager';
import { translateCategory, translateSubcategory } from '../../utils/translations';
import { cleanMalayalamText, getSearchVariants } from '../../utils/manglishTransliteration';
import TopSlidingBanner from './TopSlidingBanner';
import AsmaulHusnaScreen from './AsmaulHusnaScreen';
import CategoryDuaReader from './CategoryDuaReader';
import './CategoryDuaReader.css';

// Icon mapping
const ICON_MAP = {
  SunMedium,
  Sunrise,
  Moon,
  Sparkles,
  Users,
  Compass,
  ShieldCheck,
  HeartHandshake,
  HeartPulse,
  LifeBuoy,
  Utensils,
  BookOpen,
  GraduationCap
};

export default function DuasScreen({ 
  duas, 
  selectedCategoryId, 
  onSelectCategory, 
  favorites = [], 
  playingDuaId: _playingDuaId, 
  onToggleFavorite, 
  onTogglePlay: _onTogglePlay, 
  onSelectDua, 
  settings, 
  onNavigateTab,
  onReadingStateChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAsmaulHusnaOpen, setIsAsmaulHusnaOpen] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState(null);
  const [activeReading, setActiveReading] = useState(null);
  const searchInputRef = useRef(null);
  const isComposingRef = useRef(false);

  const focusInputToEnd = useCallback(() => {
    const el = searchInputRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
  }, []);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e) => {
    isComposingRef.current = false;
    const val = e.target.value;
    setSearchQuery(val);
    requestAnimationFrame(() => {
      focusInputToEnd();
    });
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!isSearchActive) {
      setIsSearchActive(true);
    }
  };

  // Handle mobile hardware back button for DuasScreen subviews
  useEffect(() => {
    if (!isAsmaulHusnaOpen) return;
    return registerBackButtonHandler(() => {
      setIsAsmaulHusnaOpen(false);
      return true;
    }, 70);
  }, [isAsmaulHusnaOpen]);

  useEffect(() => {
    if (!isSearchActive && !searchQuery.trim()) return;
    return registerBackButtonHandler(() => {
      if (searchQuery.trim()) {
        setSearchQuery('');
        focusInputToEnd();
      } else {
        setIsSearchActive(false);
      }
      return true;
    }, 60);
  }, [isSearchActive, searchQuery, focusInputToEnd]);

  // Ensure input gets and retains focus when search opens
  useEffect(() => {
    if (isSearchActive) {
      const timer = setTimeout(() => {
        focusInputToEnd();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchActive, focusInputToEnd]);

  // Maintain input focus across text updates and Manglish transliteration commits
  useEffect(() => {
    if (isSearchActive && !isComposingRef.current) {
      requestAnimationFrame(() => {
        focusInputToEnd();
      });
    }
  }, [searchQuery, isSearchActive, focusInputToEnd]);

  useEffect(() => {
    if (!selectedCategoryId) return;
    return registerBackButtonHandler(() => {
      onSelectCategory(null);
      return true;
    }, 40);
  }, [selectedCategoryId, onSelectCategory]);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  // Awraad comprehensive category match (daily life, prayer, etc.)
  const selectedAwraadCategory = selectedCategoryId
    ? CATEGORIES_DATA.find(c => 
        c.id === selectedCategoryId || 
        String(c.originalId) === String(selectedCategoryId) ||
        (selectedCategoryId === 'prayer' && (c.originalId === 2 || c.name.includes("നമസ്കാരം"))) ||
        ((selectedCategoryId === 'daily' || selectedCategoryId === 'daily_life' || selectedCategoryId === 'cat_1') && 
          (c.originalId === 1 || c.name.includes("നിത്യജീവിതം")))
      )
    : null;

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategoryId);

  // Duas belonging to the selected category
  const categoryDuas = activeCategory 
    ? duas.filter(d => d.categoryId === activeCategory.id)
    : [];

  // Search dataset derived strictly from "പ്രധാന വിഭാഗങ്ങൾ" (Main Categories) section and their Duas
  const mainCategoriesSearchIndex = useMemo(() => {
    const list = [];
    (CATEGORIES_DATA || []).forEach((cat) => {
      const subs = cat.subcategories || [];
      const totalDuasInCat = subs.reduce((acc, s) => acc + (s.duas?.length || 0), 0);
      const catNameEn = CATEGORY_THEMES[cat.originalId]?.nameEn || translateCategory(cat, 'en');
      const cleanCatName = (cat.name || '').replace(/[\u200B-\u200D\uFEFF]/g, '');

      // 1. Category item
      list.push({
        type: 'category',
        uniqueKey: `cat_${cat.id}`,
        category: cat,
        nameMl: cleanCatName,
        nameEn: catNameEn,
        nameAr: cat.nameArabic || '',
        subCount: subs.length,
        duaCount: totalDuasInCat,
        displaySubtitleMl: `${subs.length} ഉപവിഭാഗങ്ങൾ • ${totalDuasInCat} ദുആകൾ`,
        displaySubtitleEn: `${subs.length} Subcategories • ${totalDuasInCat} Duas`,
        searchableText: cleanMalayalamText(`${cleanCatName} ${catNameEn} ${cat.nameArabic || ''}`)
      });

      // 2. Subcategory items
      subs.forEach((sub) => {
        const subNameEn = translateSubcategory(sub, 'en');
        const cleanSubName = (sub.name || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
        const subDuaCount = sub.duas?.length || 0;

        list.push({
          type: 'subcategory',
          uniqueKey: `sub_${cat.id}_${sub.id}`,
          category: cat,
          subcategory: sub,
          nameMl: cleanSubName,
          nameEn: subNameEn,
          nameAr: sub.nameArabic || '',
          duaCount: subDuaCount,
          parentNameMl: `${cleanCatName} • ${subDuaCount} ദുആകൾ`,
          parentNameEn: `${catNameEn} • ${subDuaCount} Duas`,
          searchableText: cleanMalayalamText(`${cleanCatName} ${cleanSubName} ${catNameEn} ${subNameEn} ${sub.nameArabic || ''}`)
        });

        // 3. Duas inside this subcategory
        (sub.duas || []).forEach((d, dIdx) => {
          const rawTitleMl = ((d.desc || d.hint || `ദുആ #${d.id}`)).replace(/[\u200B-\u200D\uFEFF]/g, '');
          const rawTitleEn = d.hint || (d.trans_en ? (d.trans_en.length > 55 ? d.trans_en.slice(0, 55) + '...' : d.trans_en) : `Dua #${d.id}`);

          list.push({
            type: 'dua',
            uniqueKey: `dua_${cat.id}_${sub.id}_${d.id}_${dIdx}`,
            category: cat,
            subcategory: sub,
            dua: d,
            duaIndex: dIdx,
            id: d.id,
            titleMl: rawTitleMl,
            titleEn: rawTitleEn,
            parentNameMl: `${cleanCatName} > ${cleanSubName}`,
            parentNameEn: `${catNameEn} > ${subNameEn}`,
            searchableText: cleanMalayalamText([
              cleanCatName,
              catNameEn,
              cleanSubName,
              subNameEn,
              d.desc,
              d.trans,
              d.trans_en,
              d.hint,
              d.transli,
              d.transli_en,
              d.ref,
              d.dua
            ].filter(Boolean).join(' '))
          });
        });
      });
    });
    return list;
  }, []);

  // Filter search results exclusively from Main Categories based on Malayalam and Manglish variants
  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    const variants = getSearchVariants(q);
    if (variants.length === 0) return [];

    return mainCategoriesSearchIndex.filter(item => {
      return variants.some(v => item.searchableText.includes(v));
    });
  }, [searchQuery, mainCategoriesSearchIndex]);

  const handleSearchItemClick = (item) => {
    if (item.type === 'category') {
      onSelectCategory(item.category.id);
    } else if (item.type === 'subcategory') {
      setActiveReading({ 
        category: item.category, 
        subcategory: item.subcategory, 
        index: 0 
      });
      if (onReadingStateChange) onReadingStateChange(true);
    } else if (item.type === 'dua') {
      setActiveReading({ 
        category: item.category, 
        subcategory: item.subcategory, 
        index: item.duaIndex 
      });
      if (onReadingStateChange) onReadingStateChange(true);
    }
  };

  return (
    <div className={`reference-ui-screen ${selectedAwraadCategory || activeReading || isAsmaulHusnaOpen ? 'category-reader-active' : ''}`}>
      {/* ========================================================
          CASE 0: READING MODE (Full Dua Swiping Reader)
          ======================================================== */}
      {activeReading ? (
        <CategoryDuaReader 
          initialView="reading"
          initialCategory={activeReading.category}
          initialSubcategory={activeReading.subcategory}
          initialIndex={activeReading.index || 0}
          onBackToHome={() => {
            setActiveReading(null);
            if (onReadingStateChange) onReadingStateChange(false);
          }}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          settings={settings}
          onViewChange={(v) => onReadingStateChange && onReadingStateChange(v === 'reading')}
        />
      ) : isAsmaulHusnaOpen ? (
        <AsmaulHusnaScreen 
          onBack={() => setIsAsmaulHusnaOpen(false)}
          settings={settings}
        />
      ) : selectedAwraadCategory ? (
        /* ========================================================
           CASE 0.5: CATEGORY HIERARCHY & SWIPING READER
           Screen 1: Category Selection with subcategories accordion
           Screen 2: Multi-Page Dua Swiping Reader with real Audio, Word-by-Word,
                     Malayalam Translation, Transliteration, Reference & Virtue
           ======================================================== */
        <CategoryDuaReader 
          initialView="categories"
          initialCategory={selectedAwraadCategory}
          onBackToHome={() => {
            onSelectCategory(null);
            if (onReadingStateChange) onReadingStateChange(false);
          }}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          settings={settings}
          onViewChange={(v) => onReadingStateChange && onReadingStateChange(v === 'reading')}
        />
      ) : isSearchActive || searchQuery.trim() !== '' ? (
        <div className="search-active-container">
          <div className="search-bar-wrap" style={{ marginTop: '6px' }}>
            <Search size={18} className="search-icon-left" />
            <input 
              ref={searchInputRef}
              type="text" 
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              autoFocus
            />
            <button 
              type="button"
              className="search-clear-btn" 
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('');
                  focusInputToEnd();
                } else {
                  setIsSearchActive(false);
                }
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          </div>

          <div className="section-header" style={{ marginTop: '14px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
              {isEnglish ? "Search Results" : "തിരച്ചിൽ ഫലങ്ങൾ"} ({searchResults.length})
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">{isEnglish ? "No Results Found" : "ഫലങ്ങൾ കണ്ടെത്താനായില്ല"}</p>
              <p className="empty-desc">
                {isEnglish 
                  ? "Try searching in Malayalam or Manglish (e.g. ravile, urakkam, safar)." 
                  : "മലയാളത്തിലോ മംഗ്ലീഷിലോ തിരയുക (ഉദാ: ravile, urakkam, safar)."}
              </p>
            </div>
          ) : (
            <div className="category-duas-list">
              {searchResults.map((item) => {
                const title = isEnglish ? (item.titleEn || item.nameEn) : (item.titleMl || item.nameMl);
                const subtitle = isEnglish ? (item.parentNameEn || item.displaySubtitleEn) : (item.parentNameMl || item.displaySubtitleMl);
                const badge = item.type === 'category'
                  ? (isEnglish ? 'Category' : 'പ്രധാന വിഭാഗം')
                  : item.type === 'subcategory'
                  ? (isEnglish ? 'Subcategory' : 'ഉപവിഭാഗം')
                  : `#${item.id}`;

                return (
                  <div 
                    key={item.uniqueKey} 
                    className="dua-list-item-card"
                    onClick={() => handleSearchItemClick(item)}
                  >
                    <div className="dua-item-content">
                      <div className="dua-item-title-text">
                        {title}
                      </div>
                      <div className="dua-item-meta-sub">
                        <span>{subtitle}</span>
                        {badge && <span>• {badge}</span>}
                      </div>
                    </div>
                    <ChevronRight size={18} className="dua-item-chevron" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeCategory ? (
        /* ========================================================
           CASE 2: OTHER CATEGORIES (Screen 2: Category Duas List)
           ======================================================== */
        <div className="category-view-container">
          {/* Header matching Screen 2 */}
          <div className="category-view-header">
            <button 
              className="icon-btn category-back-btn"
              onClick={() => onSelectCategory(null)}
              title={isEnglish ? "Back to categories" : "വിഭാഗങ്ങളിലേക്ക് മടങ്ങുക"}
              aria-label="Back to categories"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="category-header-title-wrap">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  const Icon = ICON_MAP[activeCategory.icon] || Sparkles;
                  return <Icon size={20} style={{ color: activeCategory.color || 'var(--primary)' }} />;
                })()}
                <h1 className="category-main-heading">
                  {isEnglish ? activeCategory.titleEn : activeCategory.titleMl}
                </h1>
              </div>
              <div className="category-subtitle-count">
                {categoryDuas.length} {isEnglish ? "Duas" : "ദുആകൾ"}
              </div>
            </div>
          </div>

          {/* Numbered List of Duas in this category (Screen 2) */}
          <div className="category-duas-list">
            {categoryDuas.map((dua, index) => {
              const isFav = favorites.includes(dua.id);
              return (
                <div 
                  key={dua.id} 
                  className="dua-list-item-card"
                  onClick={() => onSelectDua(dua)}
                >
                  <div className="dua-item-num-badge">
                    {index + 1}
                  </div>
                  <span className="dua-item-title-text">
                    {isEnglish ? dua.titleEn : dua.titleMl}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isFav && (
                      <Heart size={14} fill="#C0392B" color="#C0392B" />
                    )}
                    <ChevronRight size={18} className="dua-item-chevron" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
           CASE 3: HOME SCREEN (Screen 1: Mosque Hero & Categories)
           ======================================================== */
        <div className="home-screen-view">
          {/* Dynamic Scenic Header & Auto/Manual Sliding Cards */}
          <TopSlidingBanner 
            onSelectCategory={onSelectCategory}
            onNavigateTab={onNavigateTab}
            onOpenAsmaulHusna={() => setIsAsmaulHusnaOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenSearch={() => setIsSearchActive(true)}
            settings={settings}
          />

          {/* Section: Main Categories (പ്രധാന വിഭാഗങ്ങൾ) */}
          <div className="home-categories-section">
            <h2 className="home-section-title">
              {isEnglish ? "Main Categories" : "പ്രധാന വിഭാഗങ്ങൾ"}
            </h2>

            {/* Complete 20-Category Accordion List (Awraad Database) */}
            <div className="cdr-cat-list" style={{ marginTop: '12px' }}>
              {CATEGORIES_DATA.map((cat) => {
                const isOpen = expandedCatId === cat.id;
                const theme = CATEGORY_THEMES[cat.originalId] || { 
                  bg: '#ECFDF5', 
                  border: '#A7F3D0', 
                  accent: '#059669', 
                  nameEn: '' 
                };

                return (
                  <div 
                    key={cat.id} 
                    className={`cdr-cat-card ${isOpen ? 'is-open' : ''}`}
                  >
                    {/* Category Header Button */}
                    <button 
                      onClick={() => setExpandedCatId(isOpen ? null : cat.id)}
                      className="cdr-cat-toggle-btn"
                      aria-expanded={isOpen}
                    >
                      <div className="cdr-cat-info">
                        <div 
                          className="cdr-cat-icon-wrap"
                          style={{
                            backgroundColor: theme.bg,
                            border: `1px solid ${theme.border}`
                          }}
                        >
                          <img 
                            src={`/category-icons/${cat.icon}`} 
                            alt={cat.name}
                            className="cdr-cat-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.cdr-cat-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="cdr-cat-fallback" 
                            style={{ display: 'none', color: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {cat.name.includes('ഖുർആൻ') ? <BookOpen size={22} /> : <Folder size={22} />}
                          </div>
                        </div>

                        <div className="cdr-cat-title-group">
                          <div className="cdr-cat-name-row">
                            <span className="cdr-cat-name">{translateCategory(cat, lang)}</span>
                            {cat.nameArabic && (
                              <span className="cdr-cat-arabic-name">{cat.nameArabic}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="cdr-chevron-pill">
                        {isOpen ? <ChevronUp size={16} strokeWidth={2.4} /> : <ChevronDown size={16} strokeWidth={2.4} />}
                      </div>
                    </button>

                    {/* Smooth CSS Grid Accordion */}
                    <div className={`cdr-accordion-wrapper ${isOpen ? 'open' : ''}`}>
                      <div className="cdr-accordion-inner">
                        {cat.subcategories.length > 0 ? (
                          <div className="cdr-cat-sublist">
                            {cat.subcategories.map((sub, sIdx) => (
                              <button 
                                key={sub.id}
                                onClick={() => setActiveReading({ category: cat, subcategory: sub, index: 0 })}
                                className="cdr-subcat-btn"
                              >
                                <div className="cdr-subcat-left">
                                  <span className="cdr-subcat-num">{sIdx + 1}</span>
                                  <span className="cdr-subcat-name">{translateSubcategory(sub, lang)}</span>
                                </div>
                                <div className="cdr-subcat-meta">
                                  <span className="cdr-subcat-badge">
                                    {sub.duas.length} {isEnglish ? "Duas" : "ദുആകൾ"}
                                  </span>
                                  <ChevronRight size={16} className="cdr-subcat-chevron" />
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="cdr-empty-subcat">
                            {isEnglish ? "No subcategories available." : "ഉപവിഭാഗങ്ങൾ ലഭ്യമല്ല."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
