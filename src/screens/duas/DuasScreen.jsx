import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import DuaCard from './DuaCard';
import HeroDua from './HeroDua';
import { UI_TEXT } from '../../utils/translations';

// Icon mapping
const ICON_MAP = {
  SunMedium,
  Sunrise,
  Moon,
  Sparkles,
  Users,
  Compass,
  ShieldCheck,
  HeartHandshake
};

export default function DuasScreen({ 
  duas, 
  selectedCategoryId, 
  onSelectCategory, 
  favorites, 
  playingDuaId, 
  onToggleFavorite, 
  onTogglePlay, 
  onSelectDua,
  heroDua,
  settings 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'all'

  const lang = settings?.language || 'ml';
  const t = UI_TEXT[lang] || UI_TEXT.ml;
  const isEnglish = lang === 'en';

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategoryId);

  // If a category is selected, filter duas belonging to that category
  const categoryDuas = activeCategory 
    ? duas.filter(d => d.categoryId === activeCategory.id)
    : [];

  // Duas matching search across all duas
  const searchResults = searchQuery.trim() === ''
    ? []
    : duas.filter(d => 
        d.titleMl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.arabic.includes(searchQuery) ||
        d.meaningMl.includes(searchQuery) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      );

  return (
    <div className="categories-screen duas-screen">
      {/* 1. If Searching: Show Global Search Results */}
      {searchQuery.trim() !== '' ? (
        <div>
          <div className="search-bar-wrap" style={{ marginTop: '4px' }}>
            <Search size={18} className="search-icon-left" />
            <input 
              type="text" 
              className="search-input"
              placeholder={t.searchPlaceholder}
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

          <div className="section-header">
            <h3 className="section-title">
              <span>{t.searchResults} ({searchResults.length})</span>
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">{t.noDuasFound}</p>
              <p className="empty-desc">
                {t.noDuasFoundDesc}
              </p>
            </div>
          ) : (
            searchResults.map(d => (
              <DuaCard 
                key={d.id} 
                dua={d} 
                isFavorite={favorites.includes(d.id)}
                isPlaying={playingDuaId === d.id}
                onToggleFavorite={onToggleFavorite}
                onTogglePlay={onTogglePlay}
                onSelectDua={onSelectDua}
                settings={settings}
              />
            ))
          )}
        </div>
      ) : activeCategory ? (
        /* 2. Specific Category Dua List View */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingTop: '4px' }}>
            <button 
              className="icon-btn"
              onClick={() => onSelectCategory(null)}
              title={isEnglish ? "Back to categories" : "വിഭാഗങ്ങളിലേക്ക് മടങ്ങുക"}
              aria-label="Back to categories"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)', lineHeight: 1.2 }}>
                {isEnglish ? activeCategory.titleEn : activeCategory.titleMl}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)' }}>
                {activeCategory.count} {isEnglish ? 'Duas' : 'ദുആകൾ'} • {isEnglish ? activeCategory.titleMl : activeCategory.titleEn}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginBottom: '16px', lineHeight: 1.5 }}>
            {isEnglish ? activeCategory.descriptionEn : activeCategory.descriptionMl}
          </p>

          {/* List of Duas in Selected Category */}
          {categoryDuas.map(d => (
            <DuaCard 
              key={d.id} 
              dua={d} 
              isFavorite={favorites.includes(d.id)}
              isPlaying={playingDuaId === d.id}
              onToggleFavorite={onToggleFavorite}
              onTogglePlay={onTogglePlay}
              onSelectDua={onSelectDua}
              settings={settings}
            />
          ))}
        </div>
      ) : (
        /* 3. Main Duas Screen: Featured Dua of the Day, Search & Categories */
        <div>
          {/* Top Title */}
          <div style={{ marginBottom: '14px', paddingTop: '4px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
              {isEnglish ? 'Islamic Supplications' : 'ഇസ്ലാമിക് ദുആകൾ'}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '2px' }}>
              {isEnglish ? 'Authentic supplications with meanings and recitation' : 'ആധികാരിക പ്രാർത്ഥനകൾ, അർത്ഥവും ഓഡിയോയും സഹിതം'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon-left" />
            <input 
              type="text" 
              className="search-input"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Featured Dua of the Day */}
          {heroDua && (
            <HeroDua 
              dua={heroDua}
              isFavorite={favorites.includes(heroDua.id)}
              isPlaying={playingDuaId === heroDua.id}
              onTogglePlay={onTogglePlay}
              onToggleFavorite={onToggleFavorite}
              onSelectDua={onSelectDua}
              settings={settings}
            />
          )}

          {/* Toggle between Category view and All Duas view */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              className={`chip-btn ${viewMode === 'categories' ? 'active' : ''}`}
              onClick={() => setViewMode('categories')}
            >
              {t.allCategories}
            </button>
            <button
              className={`chip-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              {t.allDuas} ({duas.length})
            </button>
          </div>

          {viewMode === 'categories' ? (
            /* 8 Categories Cards */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon] || Sparkles;
                const catTitle = isEnglish ? cat.titleEn : cat.titleMl;
                const catDesc = isEnglish ? cat.descriptionEn : cat.descriptionMl;

                return (
                  <div 
                    key={cat.id} 
                    className="dua-card"
                    onClick={() => onSelectCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      marginBottom: 0
                    }}
                    id={`category-item-${cat.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div 
                        className="category-icon-box"
                        style={{ backgroundColor: cat.bgLight, color: cat.color, flexShrink: 0 }}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)', lineHeight: 1.3 }}>
                          {catTitle}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-malayalam)', marginTop: '2px', lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {catDesc}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="dua-badge" style={{ backgroundColor: 'var(--bg-sage)', color: 'var(--primary)', flexShrink: 0 }}>
                        {cat.count}
                      </span>
                      <ChevronRight size={17} color="var(--text-tertiary)" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* All Duas List View */
            <div>
              {duas.map(d => (
                <DuaCard 
                  key={d.id} 
                  dua={d} 
                  isFavorite={favorites.includes(d.id)}
                  isPlaying={playingDuaId === d.id}
                  onToggleFavorite={onToggleFavorite}
                  onTogglePlay={onTogglePlay}
                  onSelectDua={onSelectDua}
                  settings={settings}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
