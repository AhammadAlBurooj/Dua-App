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
  ChevronLeft,
  Heart
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { UI_TEXT } from '../../utils/translations';
import TopSlidingBanner from './TopSlidingBanner';
import AsmaulHusnaScreen from './AsmaulHusnaScreen';

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

  return (
    <div className="reference-ui-screen">
      {/* ========================================================
          CASE 0: ASMAUL HUSNA FULL PAGE (Quran Duas Slide Format)
          ======================================================== */}
      {isAsmaulHusnaOpen ? (
        <AsmaulHusnaScreen 
          onBack={() => setIsAsmaulHusnaOpen(false)}
          settings={settings}
        />
      ) : searchQuery.trim() !== '' ? (
        <div className="search-active-container">
          <div className="search-bar-wrap" style={{ marginTop: '6px' }}>
            <Search size={18} className="search-icon-left" />
            <input 
              ref={searchInputRef}
              type="text" 
              className="search-input"
              placeholder="Search duas..."
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
              {searchResults.map((d, index) => {
                const cat = CATEGORIES.find(c => c.id === d.categoryId);
                return (
                  <div 
                    key={d.id} 
                    className="dua-list-item-card"
                    onClick={() => {
                      onSelectDua(d);
                      if (!selectedCategoryId) {
                        onSelectCategory(d.categoryId);
                      }
                    }}
                  >
                    <div className="dua-item-num-badge">
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="dua-item-title-text">
                        {isEnglish ? d.titleEn : d.titleMl}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
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
           CASE 2: CATEGORY SELECTED (Screen 2: Category Duas List)
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

          {/* Bottom Pagination Preview Bar matching Screen 2 */}
          {categoryDuas.length > 0 && (
            <div className="category-bottom-bar">
              <button 
                className="icon-btn pagination-arrow-btn"
                disabled={true}
                title="Previous"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="category-pagination-pill">
                1 / {categoryDuas.length}
              </span>
              <button 
                className="icon-btn pagination-arrow-btn"
                onClick={() => onSelectDua(categoryDuas[0])}
                title={isEnglish ? "Open first dua" : "ആദ്യത്തെ ദുആ തുറക്കുക"}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           CASE 3: HOME SCREEN (Screen 1: Mosque Hero & Categories)
           ======================================================== */
        <div className="home-screen-view">
          {/* Dynamic Scenic Header & Auto/Manual Sliding Cards (Quran, Asmaul Husna, Daily Duas) */}
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

            {/* Vertical list of Category Cards matching Screen 1 */}
            <div className="reference-categories-list">
              {CATEGORIES.map((category) => {
                const Icon = ICON_MAP[category.icon] || Sparkles;
                return (
                  <div 
                    key={category.id} 
                    className="reference-category-card"
                    onClick={() => onSelectCategory(category.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div 
                      className="category-icon-bubble"
                      style={{ 
                        backgroundColor: category.bgLight || '#EAF3EF', 
                        color: category.color || 'var(--primary)' 
                      }}
                    >
                      <Icon size={21} strokeWidth={2.2} />
                    </div>

                    <div className="category-meta-info">
                      <span className="category-meta-title">
                        {isEnglish ? category.titleEn : category.titleMl}
                      </span>
                      <span className="category-meta-count">
                        ({category.count})
                      </span>
                    </div>

                    <ChevronRight size={18} className="category-meta-chevron" />
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
