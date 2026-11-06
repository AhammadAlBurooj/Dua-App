import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';
import { ASMAUL_HUSNA } from '../../data/asmaulHusna';
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap');

        .asma-root {
          font-family: 'Inter', 'Noto Sans Malayalam', sans-serif;
          -webkit-tap-highlight-color: transparent;
          background-color: #f8fafc;
          min-height: 100vh;
          width: 100%;
          position: relative;
          color: #1e293b;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .font-arabic {
          font-family: 'Amiri', serif;
        }

        /* Premium Ambient Aurora Blobs */
        @keyframes float-slow {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.6;
          animation: float-slow 15s infinite ease-in-out;
          z-index: 0;
          pointer-events: none;
        }
        .blob-1 { top: -10%; left: -10%; width: 400px; height: 400px; background: #a7f3d0; }
        .blob-2 { top: 40%; right: -20%; width: 350px; height: 350px; background: #99f6e4; animation-delay: -5s; opacity: 0.5; }
        .blob-3 { bottom: -20%; left: 10%; width: 450px; height: 450px; background: #bae6fd; animation-delay: -10s; }

        /* Light Glassmorphism Utility */
        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .glass-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glass-card-hover:active {
          transform: scale(0.985);
        }

        /* Dark Theme Support */
        [data-theme='dark'] .asma-root {
          background-color: #0b1310;
          color: #f1f5f9;
        }
        [data-theme='dark'] .glass-card {
          background: rgba(18, 34, 27, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(52, 211, 153, 0.18);
          box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        [data-theme='dark'] .blob-1 { background: #064e3b; opacity: 0.45; }
        [data-theme='dark'] .blob-2 { background: #134e4a; opacity: 0.35; }
        [data-theme='dark'] .blob-3 { background: #0c4a6e; opacity: 0.3; }

        /* Arabic Calligraphy Glow when Playing */
        @keyframes pulse-calligraphy {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 2px 8px rgba(5, 150, 105, 0.25)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 4px 16px rgba(5, 150, 105, 0.45)); }
        }
        .calligraphy-playing {
          animation: pulse-calligraphy 2.4s infinite ease-in-out;
        }
      `}</style>

      <div className="asma-root">
        {/* Animated Aurora Background Blobs */}
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />

        {/* Sticky Top Navigation Bar */}
        <nav 
          className="glass-card"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            width: '100%',
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.6)'
          }}
        >
          <div 
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Back Button */}
            <button 
              onClick={handleBack}
              aria-label="Back to Home"
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                color: '#334155',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background-color 0.15s ease'
              }}
              className="active:scale-95"
            >
              <ArrowLeft size={19} strokeWidth={2.4} />
            </button>
            
            {/* Center Logo & Title */}
            <h1 
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}
            >
              <svg 
                style={{ width: '24px', height: '24px', color: '#059669', flexShrink: 0 }} 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                <circle cx="16" cy="7" r="1.5" />
              </svg>
              <span className="font-arabic" style={{ marginTop: '2px', fontSize: '1.45rem' }}>
                مُنَاجَاة
              </span>
            </h1>

            {/* Grid / Slide Toggle Button */}
            <button 
              onClick={() => {
                audioService.stop();
                setViewMode(viewMode === 'slide' ? 'grid' : 'slide');
              }}
              aria-label={viewMode === 'slide' ? "View Grid" : "View Slide"}
              title={viewMode === 'slide' ? "എല്ലാ നാമങ്ങളും കാണുക (Grid View)" : "സ്ലൈഡ് വ്യൂ"}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                color: '#334155',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background-color 0.15s ease'
              }}
              className="active:scale-95"
            >
              {viewMode === 'slide' ? (
                /* 4-square Grid Menu SVG icon from reference */
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              ) : (
                <Layers size={19} />
              )}
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        {viewMode === 'slide' ? (
          /* ========================================================
             CASE 1: SLIDE VIEW (Matching User Template Exactly)
             ======================================================== */
          <div 
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              width: '100%',
              padding: '20px 20px 48px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative',
              zIndex: 1
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
              <div 
                className="glass-card"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#115e59' // teal-800
                }}
              >
                <span>✨</span> #{currentName.id} / 99 • {isEnglish ? "Asmaul Husna" : "അസ്മാഉൽ ഹുസ്നാ"}
              </div>
            </div>

            {/* Main Calligraphy Card */}
            <div 
              className={`glass-card ${isCurrentPlaying ? 'calligraphy-playing' : ''}`}
              style={{
                borderRadius: '1.5rem',
                padding: '72px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle inner glow */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), transparent)',
                  zIndex: 0,
                  pointerEvents: 'none'
                }} 
              />
              <span 
                className="font-arabic"
                style={{
                  fontSize: '5.5rem',
                  color: '#065f46', // emerald-800
                  fontWeight: 700,
                  zIndex: 10,
                  lineHeight: 1.2,
                  textAlign: 'center',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))'
                }}
              >
                {currentName.arabic}
              </span>
            </div>

            {/* Audio Player Card */}
            <div 
              onClick={() => handleTogglePlay(currentName)}
              className="glass-card glass-card-hover"
              style={{
                borderRadius: '1rem',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Large Emerald Play Circle */}
                <div 
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#059669', // emerald-600
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.35)',
                    color: '#ffffff',
                    flexShrink: 0,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {isCurrentPlaying ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" style={{ marginLeft: '3px' }} />
                  )}
                </div>
                <div>
                  <h3 
                    style={{
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '1.125rem',
                      margin: '0 0 2px 0'
                    }}
                  >
                    {isCurrentPlaying ? (isEnglish ? "Playing Recitation..." : "പാരായണം കേൾക്കുന്നു...") : (isEnglish ? "Listen Recitation" : "പാരായണം കേൾക്കുക")}
                  </h3>
                  <p 
                    style={{
                      fontSize: '0.875rem',
                      color: '#475569',
                      fontWeight: 500,
                      margin: 0
                    }}
                  >
                    {currentName.transliterationEn || currentName.transliteration} • {isEnglish ? "Studio Audio" : "സ്റ്റുഡിയോ ഓഡിയോ"}
                  </p>
                </div>
              </div>

              {/* Loop / Repeat Sound Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.toggleLoop();
                }}
                title={audioState.isLoop ? "Loop On" : "Loop Off"}
                aria-label="Toggle Repeat"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  backgroundColor: audioState.isLoop ? 'rgba(5, 150, 105, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: audioState.isLoop ? '#059669' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                {audioState.isLoop ? (
                  <Volume2 size={20} strokeWidth={2} />
                ) : (
                  <Volume2 size={20} strokeWidth={1.8} />
                )}
              </button>
            </div>

            {/* Detail Cards Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Transliteration */}
              <div className="glass-card" style={{ borderRadius: '1rem', padding: '20px' }}>
                <h4 
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#047857', // emerald-700
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px 0'
                  }}
                >
                  {isEnglish ? "Pronunciation (Transliteration)" : "ഉച്ചാരണം (Transliteration)"}
                </h4>
                <p 
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: 0
                  }}
                >
                  {currentName.transliteration}
                </p>
              </div>

              {/* Meaning */}
              <div className="glass-card" style={{ borderRadius: '1rem', padding: '20px' }}>
                <h4 
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#047857', // emerald-700
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px 0'
                  }}
                >
                  {isEnglish ? "Malayalam Meaning" : "മലയാളം അർത്ഥം"}
                </h4>
                <p 
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: 0
                  }}
                >
                  {currentName.meaningMl}
                </p>
              </div>

              {/* Translation */}
              <div className="glass-card" style={{ borderRadius: '1rem', padding: '20px' }}>
                <h4 
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#047857', // emerald-700
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 8px 0'
                  }}
                >
                  English Translation
                </h4>
                <p 
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: 0
                  }}
                >
                  {currentName.meaningEn}
                </p>
              </div>

              {/* Hadith Card */}
              <div 
                className="glass-card" 
                style={{
                  borderRadius: '1rem',
                  padding: '20px',
                  display: 'flex',
                  gap: '16px',
                  marginTop: '4px'
                }}
              >
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#ecfdf5', // emerald-50
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669', // emerald-600
                    flexShrink: 0,
                    border: '1px solid #d1fae5',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <BookOpen size={20} strokeWidth={2} />
                </div>
                <div>
                  <h4 
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#047857', // emerald-700
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 8px 0'
                    }}
                  >
                    {isEnglish ? "Authentic Hadith" : "വിശുദ്ധ ഹദീസ്"}
                  </h4>
                  <p 
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#334155',
                      lineHeight: 1.6,
                      margin: 0
                    }}
                  >
                    {isEnglish 
                      ? "The Prophet (ﷺ) said: 'Allah has ninety-nine names; whoever preserves and memorizes them will enter Paradise.' (Sahih al-Bukhari 2736, Sahih Muslim 2677)"
                      : "നബി (സ) അരുളി: 'തീർച്ചയായും അല്ലാഹുവിന് 99 നാമങ്ങളുണ്ട്. അവ ഹൃദിസ്ഥമാക്കിയവൻ സ്വർഗത്തിൽ പ്രവേശിക്കും.' (സഹീഹ് അൽ-ബുഖാരി 2736, സഹീഹ് മുസ്ലിം 2677)"
                    }
                  </p>
                </div>
              </div>

            </div>

            {/* Previous & Next Navigation Controls */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '12px',
                paddingBottom: '16px'
              }}
            >
              <button 
                onClick={handlePrev}
                disabled={!hasPrev}
                className="glass-card active:scale-95"
                style={{
                  opacity: hasPrev ? 1 : 0.4,
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: hasPrev ? 'pointer' : 'default',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  transition: 'all 0.15s ease'
                }}
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
                <span>{isEnglish ? "Previous" : "മുമ്പത്തേത്"}</span>
              </button>

              <span 
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#059669'
                }}
              >
                {currentIndex + 1} / {totalNames}
              </span>

              <button 
                onClick={handleNext}
                disabled={!hasNext}
                className="glass-card active:scale-95"
                style={{
                  opacity: hasNext ? 1 : 0.4,
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: hasNext ? 'pointer' : 'default',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{isEnglish ? "Next" : "അടുത്തത്"}</span>
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             CASE 2: GRID VIEW (Browse all 99 Names)
             ======================================================== */
          <div 
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              width: '100%',
              padding: '16px 20px 80px',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Search Input Box */}
            <div 
              className="glass-card"
              style={{
                borderRadius: '1rem',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
              }}
            >
              <Search size={18} style={{ color: '#059669', flexShrink: 0 }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEnglish ? "Search 99 names..." : "തിരുനാമങ്ങൾ അല്ലെങ്കിൽ അർത്ഥം തിരയുക..."}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.925rem',
                  fontWeight: 500,
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Grid of 99 Names */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px'
              }}
            >
              {filteredNames.map(item => {
                const originalIndex = ASMAUL_HUSNA.findIndex(n => n.id === item.id);
                const isItemPlaying = audioState.isPlaying && audioState.currentDuaId === `asma-${item.id}`;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(originalIndex !== -1 ? originalIndex : 0);
                      setViewMode('slide');
                    }}
                    className="glass-card glass-card-hover"
                    style={{
                      padding: '14px 10px',
                      textAlign: 'center',
                      borderRadius: '1rem',
                      cursor: 'pointer',
                      position: 'relative',
                      border: isItemPlaying ? '1.5px solid #059669' : '1px solid rgba(255, 255, 255, 0.85)'
                    }}
                  >
                    {/* Number Badge */}
                    <span 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#047857',
                        backgroundColor: '#ecfdf5',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      #{item.id}
                    </span>

                    {/* Quick Play Audio Button */}
                    <button
                      onClick={(e) => handleTogglePlay(item, e)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '8px',
                        background: isItemPlaying ? '#059669' : 'rgba(255, 255, 255, 0.8)',
                        color: isItemPlaying ? '#ffffff' : '#059669',
                        border: '1px solid rgba(5, 150, 105, 0.2)',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title={isItemPlaying ? "Pause" : "Play"}
                    >
                      {isItemPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" style={{ marginLeft: '1px' }} />}
                    </button>

                    {/* Arabic Text */}
                    <div 
                      className="font-arabic"
                      style={{
                        fontSize: '26px',
                        color: '#065f46',
                        fontWeight: 700,
                        marginTop: '16px',
                        marginBottom: '4px',
                        lineHeight: 1.5
                      }}
                    >
                      {item.arabic}
                    </div>

                    {/* Transliteration */}
                    <div 
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '2px'
                      }}
                    >
                      {item.transliteration}
                    </div>

                    {/* Meaning */}
                    <div 
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        lineHeight: 1.3
                      }}
                    >
                      {isEnglish ? item.meaningEn : item.meaningMl}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredNames.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  {isEnglish ? "No names found" : "നാമങ്ങൾ കണ്ടെത്താനായില്ല"}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                  {isEnglish ? "Try another search keyword." : "മറ്റൊരു വാക്ക് നൽകി തിരയുക."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
