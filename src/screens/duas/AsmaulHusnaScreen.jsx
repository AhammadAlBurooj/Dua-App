import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Search, 
  X, 
  LayoutGrid, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { ASMAUL_HUSNA } from '../../data/asmaulHusna';
import { UI_TEXT } from '../../utils/translations';

export default function AsmaulHusnaScreen({ onBack, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0); // 0 to 98
  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  const totalNames = ASMAUL_HUSNA.length; // 99
  const currentName = ASMAUL_HUSNA[currentIndex] || ASMAUL_HUSNA[0];

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalNames - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Keyboard navigation for slide view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'slide') return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex]);

  // Touch Swipe Handlers for Slide View
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0 && hasNext) {
        handleNext();
      } else if (diff < 0 && hasPrev) {
        handlePrev();
      }
    }
  };

  // Filtered names for grid view
  const filteredNames = ASMAUL_HUSNA.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.transliteration.toLowerCase().includes(q) ||
      item.meaningMl.toLowerCase().includes(q) ||
      item.meaningEn.toLowerCase().includes(q) ||
      item.arabic.includes(searchQuery) ||
      String(item.id) === searchQuery.trim()
    );
  });

  return (
    <div className="reference-ui-screen asmaul-husna-screen">
      {/* ========================================================
          1. TOP NAVIGATION BAR (Matching Quran Duas Screen Header)
          ======================================================== */}
      <div className="ref-detail-top-bar">
        <button 
          className="icon-btn ref-back-btn"
          onClick={onBack}
          title={isEnglish ? "Back to Home" : "തിരികെ ഹോമിലേക്ക്"}
          aria-label="Back to Home"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="ref-header-center-info">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span className="ref-header-cat-title">
              {isEnglish ? "Asmaul Husna" : "അസ്മാഉൽ ഹുസ്നാ"}
            </span>
          </div>
          <span className="ref-header-num-info">
            {viewMode === 'slide' 
              ? `${currentIndex + 1} / ${totalNames}` 
              : `${totalNames} ${isEnglish ? "Names" : "തിരുനാമങ്ങൾ"}`}
          </span>
        </div>

        {/* View mode toggle button (Slide vs Grid) */}
        <button 
          className="icon-btn"
          onClick={() => setViewMode(viewMode === 'slide' ? 'grid' : 'slide')}
          title={viewMode === 'slide' ? (isEnglish ? "Switch to Grid View" : "എല്ലാ നാമങ്ങളും കാണുക") : (isEnglish ? "Switch to Slide View" : "സ്ലൈഡ് വ്യൂ")}
          aria-label="Toggle View Mode"
          style={{ 
            backgroundColor: 'var(--bg-surface-soft)', 
            color: 'var(--primary)',
            width: '38px',
            height: '38px'
          }}
        >
          {viewMode === 'slide' ? <LayoutGrid size={18} /> : <Layers size={18} />}
        </button>
      </div>

      {/* ========================================================
          2. CONTENT BODY (Slide View OR Grid View)
          ======================================================== */}
      {viewMode === 'slide' ? (
        /* --------------------------------------------------------
           SLIDE VIEW: Like Quran Duas Slides
           -------------------------------------------------------- */
        <div 
          className="ref-detail-scroll-body asmaul-slide-body"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Decorative Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <span 
              className="dua-badge"
              style={{ 
                backgroundColor: 'var(--bg-sage)', 
                color: 'var(--primary)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={13} />
              <span>#{currentName.id} {isEnglish ? "of" : "/"} 99 • {isEnglish ? "Asmaul Husna" : "അസ്മാഉൽ ഹുസ്നാ"}</span>
            </span>
          </div>

          {/* Large Arabic Calligraphy Card (Matching Quran Duas ref-arabic-card) */}
          <div 
            className="ref-arabic-card"
            style={{ 
              textAlign: 'center', 
              padding: '28px 16px',
              background: 'linear-gradient(180deg, #EAF3EF 0%, #F5F9F7 100%)',
              border: '1.5px solid rgba(23, 91, 70, 0.18)',
              borderRadius: '24px',
              boxShadow: '0 4px 16px rgba(23, 91, 70, 0.08)'
            }}
          >
            <p 
              className="ref-arabic-text"
              style={{ 
                fontSize: '44px', 
                color: 'var(--primary)', 
                lineHeight: 1.8, 
                fontWeight: 700,
                margin: '0 auto',
                textShadow: '0 2px 4px rgba(23, 91, 70, 0.1)'
              }}
            >
              {currentName.arabic}
            </p>
          </div>

          {/* Pronunciation Section: ഉച്ചാരണം (മലയാളത്തിൽ) */}
          <div className="ref-section-block" style={{ marginTop: '16px' }}>
            <h3 className="ref-section-title">
              {isEnglish ? "Pronunciation (Transliteration)" : "ഉച്ചാരണം (Transliteration)"}
            </h3>
            <p className="ref-section-text ref-transliteration-text" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              {currentName.transliteration}
            </p>
          </div>

          {/* Malayalam Meaning Section: മലയാളം അർത്ഥം */}
          <div className="ref-section-block">
            <h3 className="ref-section-title">
              {isEnglish ? "Malayalam Meaning" : "മലയാളം അർത്ഥം"}
            </h3>
            <p className="ref-section-text ref-meaning-ml-text" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.5 }}>
              {currentName.meaningMl}
            </p>
          </div>

          {/* English Translation Section */}
          <div className="ref-section-block">
            <h3 className="ref-section-title">
              English Translation
            </h3>
            <p className="ref-section-text ref-meaning-en-text" style={{ fontSize: '14.5px', color: 'var(--text-muted)' }}>
              {currentName.meaningEn}
            </p>
          </div>

          {/* Authentic Hadith Reference Card */}
          <div className="ref-reference-card" style={{ marginTop: '18px' }}>
            <div className="ref-book-icon-bubble">
              <BookOpen size={17} />
            </div>
            <div className="ref-reference-col">
              <span className="ref-label-sub">
                {isEnglish ? "Authentic Hadith" : "വിശുദ്ധ ഹദീസ്"}
              </span>
              <span className="ref-text-val" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                {isEnglish 
                  ? "Prophet Muhammad (ﷺ) said: 'Allah has ninety-nine names; whoever preserves and memorizes them will enter Paradise.' (Sahih al-Bukhari 2736, Sahih Muslim 2677)"
                  : "നബി (സ) അരുളി: 'തീർച്ചയായും അല്ലാഹുവിന് 99 നാമങ്ങളുണ്ട്. അവ ഹൃദിസ്ഥമാക്കിയവൻ സ്വർഗ്ഗത്തിൽ പ്രവേശിച്ചു.' (സഹീഹ് അൽ-ബുഖാരി 2736, സഹീഹ് മുസ്ലിം 2677)"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* --------------------------------------------------------
           GRID / LIST VIEW: Browse all 99 Names
           -------------------------------------------------------- */
        <div className="ref-detail-scroll-body" style={{ padding: '14px 16px 80px' }}>
          {/* Search Box */}
          <div className="search-bar-wrap" style={{ margin: '0 0 16px 0' }}>
            <Search size={17} className="search-icon-left" />
            <input 
              type="text"
              className="search-input"
              placeholder={isEnglish ? "Search 99 names..." : "തിരുനാമങ്ങൾ അല്ലെങ്കിൽ അർത്ഥം തിരയുക..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* 99 Names Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {filteredNames.map((item, idx) => {
              const originalIndex = ASMAUL_HUSNA.findIndex(n => n.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(originalIndex !== -1 ? originalIndex : 0);
                    setViewMode('slide');
                  }}
                  className="dua-card"
                  style={{
                    padding: '12px 10px',
                    textAlign: 'center',
                    marginBottom: 0,
                    cursor: 'pointer',
                    borderRadius: '16px',
                    position: 'relative'
                  }}
                >
                  <span 
                    style={{ 
                      position: 'absolute', 
                      top: '6px', 
                      left: '8px', 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      color: 'var(--text-tertiary)',
                      background: 'var(--bg-sage)',
                      padding: '1px 6px',
                      borderRadius: '8px'
                    }}
                  >
                    #{item.id}
                  </span>

                  <div 
                    className="arabic-text"
                    style={{ 
                      fontSize: '22px', 
                      color: 'var(--primary)', 
                      marginTop: '10px', 
                      marginBottom: '4px',
                      lineHeight: 1.6
                    }}
                  >
                    {item.arabic}
                  </div>

                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                    {item.transliteration}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', lineHeight: 1.3 }}>
                    {isEnglish ? item.meaningEn : item.meaningMl}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNames.length === 0 && (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <p className="empty-title">{isEnglish ? "No names found" : "നാമങ്ങൾ കണ്ടെത്താനായില്ല"}</p>
              <p className="empty-desc">{isEnglish ? "Try another search keyword." : "മറ്റൊരു വാക്ക് നൽകി തിരയുക."}</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. BOTTOM PAGINATION CONTROLS BAR (Matches Quran Duas Slides)
          ======================================================== */}
      {viewMode === 'slide' && (
        <div className="ref-detail-bottom-nav-bar">
          <button 
            className="ref-nav-prev-btn"
            disabled={!hasPrev}
            onClick={handlePrev}
          >
            <span>← {isEnglish ? "Previous" : "മുമ്പത്തേത്"}</span>
          </button>

          <div className="ref-pagination-center-text">
            {currentIndex + 1} / {totalNames}
          </div>

          <button 
            className="ref-nav-next-btn"
            disabled={!hasNext}
            onClick={handleNext}
          >
            <span>{isEnglish ? "Next" : "അടുത്തത്"} →</span>
          </button>
        </div>
      )}
    </div>
  );
}
