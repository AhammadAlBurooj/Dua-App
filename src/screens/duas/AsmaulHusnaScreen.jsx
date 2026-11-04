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
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { ASMAUL_HUSNA } from '../../data/asmaulHusna';
import { UI_TEXT } from '../../utils/translations';
import { audioService } from '../../utils/audioService';

export default function AsmaulHusnaScreen({ onBack, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0); // 0 to 98
  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [audioState, setAudioState] = useState(audioService.getState());
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  const totalNames = ASMAUL_HUSNA.length; // 99
  const currentName = ASMAUL_HUSNA[currentIndex] || ASMAUL_HUSNA[0];

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalNames - 1;

  // Listen to audio service state
  useEffect(() => {
    const unsub = audioService.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsub;
  }, []);

  const isCurrentPlaying = audioState.isPlaying && audioState.currentDuaId === `asma-${currentName.id}`;

  const handleTogglePlay = (name = currentName, e) => {
    if (e) e.stopPropagation();
    if (!name.audioUrl) return;
    const nameId = `asma-${name.id}`;
    if (audioState.isPlaying && audioState.currentDuaId === nameId) {
      audioService.pause();
    } else {
      audioService.playDua({
        id: nameId,
        audioUrl: name.audioUrl,
        titleMl: name.meaningMl,
        titleEn: name.meaningEn,
        reciter: 'യഥാർത്ഥ പാരായണം (Authentic Recitation)'
      });
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      audioService.stop();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      audioService.stop();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    audioService.stop();
    onBack();
  };

  // Keyboard navigation for slide view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'slide') return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex, isCurrentPlaying, hasPrev, hasNext]);

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
      (item.transliteration && item.transliteration.toLowerCase().includes(q)) ||
      (item.transliterationMl && item.transliterationMl.includes(searchQuery)) ||
      (item.meaningMl && item.meaningMl.toLowerCase().includes(q)) ||
      (item.meaningEn && item.meaningEn.toLowerCase().includes(q)) ||
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
          onClick={handleBack}
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
          onClick={() => {
            audioService.stop();
            setViewMode(viewMode === 'slide' ? 'grid' : 'slide');
          }}
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
           SLIDE VIEW: Like Quran Duas Slides with Full Audio Bar
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
            className={`ref-arabic-card ${isCurrentPlaying ? 'playing-glow' : ''}`}
            style={{ 
              textAlign: 'center', 
              padding: '28px 16px',
              background: 'linear-gradient(180deg, #EAF3EF 0%, #F5F9F7 100%)',
              border: isCurrentPlaying ? '2px solid var(--primary)' : '1.5px solid rgba(23, 91, 70, 0.18)',
              borderRadius: '24px',
              boxShadow: isCurrentPlaying ? '0 6px 20px rgba(23, 91, 70, 0.18)' : '0 4px 16px rgba(23, 91, 70, 0.08)',
              transition: 'all 0.3s ease'
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

          {/* Cloudflare Worker Authentic Audio Player Bar */}
          <div 
            className="ref-inline-audio-bar"
            style={{ 
              marginTop: '14px', 
              marginBottom: '10px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="ref-audio-play-circle"
                onClick={() => handleTogglePlay(currentName)}
                aria-label={isCurrentPlaying ? "Pause Audio" : "Play Audio"}
                title={isCurrentPlaying ? (isEnglish ? "Pause" : "നിർത്തുക") : (isEnglish ? "Play" : "ഓഡിയോ കേൾക്കുക")}
              >
                {isCurrentPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '1.5px' }} />}
              </button>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
                  {isCurrentPlaying ? (isEnglish ? "Playing Recitation..." : "പാരായണം കേൾക്കുന്നു...") : (isEnglish ? "Listen Recitation" : "പാരായണം കേൾക്കുക")}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {currentName.transliterationEn || currentName.transliteration} • സ്റ്റുഡിയോ ഓഡിയോ
                </div>
              </div>
            </div>

            <button
              className={`icon-btn ref-audio-opt-btn ${audioState.isLoop ? 'active' : ''}`}
              onClick={() => audioService.toggleLoop()}
              title={audioState.isLoop ? "Repeat: Active" : "Repeat"}
              style={{ width: '34px', height: '34px' }}
            >
              <Volume2 size={16} color={isCurrentPlaying ? 'var(--primary)' : 'var(--text-tertiary)'} />
            </button>
          </div>

          {/* Pronunciation Section: ഉച്ചാരണം (മലയാളത്തിൽ) */}
          <div className="ref-section-block" style={{ marginTop: '14px' }}>
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

          {/* Prev / Next Bottom Navigation Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '22px', marginBottom: '26px' }}>
            <button 
              className="icon-btn"
              onClick={handlePrev}
              disabled={!hasPrev}
              style={{ 
                opacity: hasPrev ? 1 : 0.35, 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border-light)',
                padding: '9px 16px',
                width: 'auto',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: hasPrev ? 'pointer' : 'default'
              }}
            >
              <ChevronLeft size={16} />
              <span>{isEnglish ? "Previous" : "മുമ്പത്തേത്"}</span>
            </button>

            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
              {currentIndex + 1} / {totalNames}
            </span>

            <button 
              className="icon-btn"
              onClick={handleNext}
              disabled={!hasNext}
              style={{ 
                opacity: hasNext ? 1 : 0.35, 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border-light)',
                padding: '9px 16px',
                width: 'auto',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: hasNext ? 'pointer' : 'default'
              }}
            >
              <span>{isEnglish ? "Next" : "അടുത്തത്"}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* --------------------------------------------------------
           GRID / LIST VIEW: Browse all 99 Names with Play Buttons
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
              const isItemPlaying = audioState.isPlaying && audioState.currentDuaId === `asma-${item.id}`;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(originalIndex !== -1 ? originalIndex : 0);
                    setViewMode('slide');
                  }}
                  className={`dua-card ${isItemPlaying ? 'playing-glow' : ''}`}
                  style={{
                    padding: '12px 10px',
                    textAlign: 'center',
                    marginBottom: 0,
                    cursor: 'pointer',
                    borderRadius: '16px',
                    position: 'relative',
                    border: isItemPlaying ? '1.5px solid var(--primary)' : '1px solid var(--border-light)'
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

                  {/* Play audio button on grid card */}
                  <button
                    onClick={(e) => handleTogglePlay(item, e)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '8px',
                      background: isItemPlaying ? 'var(--primary)' : 'var(--bg-surface-soft)',
                      color: isItemPlaying ? '#fff' : 'var(--primary)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title={isItemPlaying ? "Pause" : "Play"}
                  >
                    {isItemPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '1px' }} />}
                  </button>

                  <div 
                    className="arabic-text"
                    style={{ 
                      fontSize: '22px', 
                      color: 'var(--primary)', 
                      marginTop: '12px', 
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
    </div>
  );
}
