import React, { useState, useRef } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CATEGORIES_DATA, CATEGORY_THEMES } from '../../data/categoriesData';
import { UI_TEXT } from '../../utils/translations';
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
  playingDuaId, 
  onToggleFavorite, 
  onTogglePlay, 
  onSelectDua, 
  settings, 
  onNavigateTab 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAsmaulHusnaOpen, setIsAsmaulHusnaOpen] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState(null);
  const [activeReading, setActiveReading] = useState(null);
  const searchInputRef = useRef(null);

  const lang = settings?.language || 'ml';
  const t = UI_TEXT[lang] || UI_TEXT.ml;
  const isEnglish = lang === 'en';

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategoryId);

  // Duas belonging to the selected category
  const categoryDuas = activeCategory 
    ? duas.filter(d => d.categoryId === activeCategory.id)
    : [];

  // Duas matching search across all duas
  const searchResults = searchQuery.trim() === ''
    ? []
    : duas.filter(d => 
        d.titleMl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.transliteration && d.transliteration.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.arabic.includes(searchQuery) ||
        d.meaningMl.includes(searchQuery) ||
        (d.tags && d.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );

  const handleSearchItemClick = (d) => {
    onSelectDua(d);
  };

  return (
    <div className={`reference-ui-screen ${selectedCategoryId === 'prayer' || activeReading ? 'category-reader-active' : ''}`}>
      {/* ========================================================
          CASE 0: READING MODE (Full Dua Swiping Reader)
          ======================================================== */}
      {activeReading ? (
        <CategoryDuaReader 
          initialView="reading"
          initialCategory={activeReading.category}
          initialSubcategory={activeReading.subcategory}
          initialIndex={activeReading.index || 0}
          onBackToHome={() => setActiveReading(null)}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ) : isAsmaulHusnaOpen ? (
        <AsmaulHusnaScreen 
          onBack={() => setIsAsmaulHusnaOpen(false)}
          settings={settings}
        />
      ) : selectedCategoryId === 'prayer' ? (
        /* ========================================================
           CASE 0.5: CATEGORY 'നമസ്കാരം' (Category Hierarchy & Swiping Reader)
           Exact component provided by user:
           Screen 1: Category Selection with subcategories accordion
           Screen 2: Multi-Page Dua Swiping Reader with real Audio, Word-by-Word,
                     Malayalam Translation, Transliteration, Reference & Virtue
           ======================================================== */
        <CategoryDuaReader 
          initialView="categories"
          initialCategory={CATEGORIES_DATA.find(c => c.originalId === 2 || c.name.includes("നമസ്കാരം")) || CATEGORIES_DATA[0]}
          onBackToHome={() => onSelectCategory(null)}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ) : searchQuery.trim() !== '' ? (
        <div className="search-active-container">
          <div className="search-bar-wrap" style={{ marginTop: '6px' }}>
            <Search size={18} className="search-icon-left" />
            <input 
              ref={searchInputRef}
              type="text" 
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button 
              className="search-clear-btn" 
              onClick={() => setSearchQuery('')}
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
              <p className="empty-title">{isEnglish ? "No Duas Found" : "ദുആകൾ കണ്ടെത്താനായില്ല"}</p>
              <p className="empty-desc">
                {isEnglish ? "Please try another keyword." : "മറ്റൊരു വാക്ക് നൽകി വീണ്ടും തിരയുക."}
              </p>
            </div>
          ) : (
            <div className="category-duas-list">
              {searchResults.map((d) => {
                const cat = CATEGORIES.find(c => c.id === d.categoryId);
                return (
                  <div 
                    key={d.id} 
                    className="dua-list-item-card"
                    onClick={() => handleSearchItemClick(d)}
                  >
                    <div className="dua-item-content">
                      <div className="dua-item-title-text">
                        {isEnglish ? d.titleEn : d.titleMl}
                      </div>
                      <div className="dua-item-meta-sub">
                        <span>{cat ? (isEnglish ? cat.titleEn : cat.titleMl) : ''}</span>
                        {d.authenticity && <span>• {d.authenticity}</span>}
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
                const totalDuas = cat.subcategories.reduce(
                  (sum, sub) => sum + (sub.duas ? sub.duas.length : 0), 
                  0
                );

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
                            style={{ display: 'none', color: theme.accent, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Folder size={22} />
                          </div>
                        </div>

                        <div className="cdr-cat-title-group">
                          <div className="cdr-cat-name-row">
                            <span className="cdr-cat-name">{cat.name}</span>
                            {cat.nameArabic && (
                              <span className="cdr-cat-arabic-name">{cat.nameArabic}</span>
                            )}
                          </div>
                          <div className="cdr-cat-meta-sub">
                            <span>{cat.subcategories.length} {isEnglish ? "sections" : "ഉപവിഭാഗങ്ങൾ"}</span>
                            <span className="cdr-cat-meta-dot">•</span>
                            <span>{totalDuas} {isEnglish ? "Duas" : "പ്രാർത്ഥനകൾ"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cdr-chevron-pill">
                        <ChevronDown size={18} />
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
                                  <span className="cdr-subcat-name">{sub.name}</span>
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
