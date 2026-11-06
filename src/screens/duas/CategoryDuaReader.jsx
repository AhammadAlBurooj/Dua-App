import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Copy, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Info,
  ArrowLeft,
  Folder,
  Sparkles
} from 'lucide-react';
import { CATEGORIES_DATA, CATEGORY_THEMES } from '../../data/categoriesData';
import { registerBackButtonHandler } from '../../utils/backButtonManager';
import './CategoryDuaReader.css';

const AUDIO_BASE = 'https://crimson-cell-3d4c.mubarakar95.workers.dev/';

// Active audio tracker so only one audio plays at any time,
// while allowing audio to continue normally across page navigation/swiping.
let globalActiveAudioStop = null;

// --- REAL AUDIO PLAYER COMPONENT ---
const AudioPlayer = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const fullUrl = url ? (url.startsWith('http') ? url : `${AUDIO_BASE}${url}.mp3`) : null;

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (globalActiveAudioStop === stopPlayback) {
        globalActiveAudioStop = null;
      }
    };
  }, [stopPlayback]);

  const togglePlay = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault?.();
    }
    if (!fullUrl) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      if (globalActiveAudioStop === stopPlayback) {
        globalActiveAudioStop = null;
      }
    } else {
      // Pause any previously playing audio in other cards
      if (globalActiveAudioStop && globalActiveAudioStop !== stopPlayback) {
        globalActiveAudioStop();
      }
      globalActiveAudioStop = stopPlayback;

      if (!audioRef.current) {
        audioRef.current = new Audio(fullUrl);

        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current && audioRef.current.duration) {
            const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(pct);
          }
        });

        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
          if (globalActiveAudioStop === stopPlayback) {
            globalActiveAudioStop = null;
          }
        });

        audioRef.current.addEventListener('error', () => {
          setIsPlaying(false);
          if (globalActiveAudioStop === stopPlayback) {
            globalActiveAudioStop = null;
          }
        });
      }

      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
        if (globalActiveAudioStop === stopPlayback) {
          globalActiveAudioStop = null;
        }
      });
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    setProgress(pct);
  };

  return (
    <div 
      className="cdr-audio-player flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm mt-6"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button 
        type="button"
        onClick={togglePlay}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="cdr-audio-play-btn w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md flex-shrink-0"
        aria-label={isPlaying ? "Pause" : "Play"}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
      </button>
      <div 
        className="cdr-audio-track-wrap flex-1 cursor-pointer" 
        onClick={handleSeek}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        role="progressbar"
      >
        <div className="cdr-audio-track h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
          <div 
            className="cdr-audio-fill h-full bg-emerald-600 rounded-full transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button 
        type="button"
        className="cdr-audio-vol-btn text-emerald-600 hover:text-emerald-800 p-1"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setProgress(0);
          }
        }}
        title="Replay"
        aria-label="Replay audio"
      >
        <Volume2 size={20} />
      </button>
    </div>
  );
};

// --- WORD BY WORD ACCORDION ---
const WordByWordAccordion = ({ words }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!words || words.length === 0) return null;

  return (
    <div className="cdr-wbw-box mt-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm max-w-full">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="cdr-wbw-btn w-full px-3.5 py-3 flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="cdr-wbw-title flex items-center gap-2 text-slate-700 font-medium min-w-0 flex-1 flex-wrap">
          <BookOpen size={18} className="text-emerald-600 flex-shrink-0" />
          <span className="break-words">Word by Word Meaning (പദാനുപദ അർത്ഥം)</span>
          <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, flexShrink: 0 }}>
            {words.length} പദങ്ങൾ
          </span>
        </div>
        <div className="flex-shrink-0 text-slate-500">
          {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
        </div>
      </button>
      
      {isOpen && (
        <div className="cdr-wbw-grid p-2.5 sm:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 bg-white border-t border-slate-100">
          {words.map((word, idx) => (
            <div key={idx} className="cdr-wbw-card min-w-0 flex flex-col items-end text-right p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors overflow-hidden">
              <span className="cdr-wbw-ar text-lg sm:text-xl font-arabic text-emerald-900 mb-1.5 font-medium max-w-full break-words" dir="rtl">{word.ar}</span>
              <span className="cdr-wbw-ml text-xs sm:text-sm text-slate-600 w-full text-right font-malayalam break-words leading-relaxed">{word.ml}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- DUA CARD ---
const DuaCard = ({ 
  dua, 
  currentPage, 
  totalPages, 
  isCurrentSlide,
  isBookmarked,
  onToggleBookmark
}) => {
  const [localBookmarked, setLocalBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const bookmarkedStatus = isBookmarked !== undefined ? isBookmarked : localBookmarked;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${dua.dua}\n\n${dua.trans}\n\n${dua.ref}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `${dua.dua}\n\n${dua.trans}\n\n${dua.ref}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dua #${dua.id}`,
          text
        });
      } catch (err) {
        // Ignored
      }
    } else {
      handleCopy();
    }
  };

  const handleBookmarkClick = () => {
    if (onToggleBookmark) {
      onToggleBookmark(dua.id !== undefined ? String(dua.id) : dua);
    } else {
      setLocalBookmarked(!localBookmarked);
    }
  };

  return (
    <div className="cdr-card-scroll w-full h-full p-4 sm:p-6 overflow-y-auto pb-6 scroll-smooth">
      <div className="cdr-dua-card max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Card Header */}
        <div className="cdr-card-header">
          {/* Row 1: Badges & Action Buttons */}
          <div className="cdr-card-top-bar">
            <div className="cdr-top-badge-wrap">
              <span className="cdr-dua-badge">
                Dua #{dua.id}
              </span>
              {/* Short hint / repetition badge (<= 40 chars, e.g. "✨ ഇത് മൂന്ന് പ്രാവശ്യം പറയുക") */}
              {dua.hint && dua.hint.trim().length <= 40 && (
                <span className="cdr-short-hint-pill">
                  ✨ {dua.hint.trim()}
                </span>
              )}
            </div>

            <div 
              className="cdr-card-actions"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleCopy} 
                className="cdr-action-btn"
                title="Copy Dua"
                aria-label="Copy Dua"
              >
                <Copy size={18} />
                {copied && (
                  <span className="cdr-copied-pill">
                    Copied!
                  </span>
                )}
              </button>
              <button 
                onClick={handleBookmarkClick} 
                className={`cdr-action-btn ${bookmarkedStatus ? 'bookmarked' : ''}`}
                title={bookmarkedStatus ? "Remove Bookmark" : "Bookmark Dua"}
                aria-label="Bookmark"
              >
                {bookmarkedStatus ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
              </button>
              <button 
                onClick={handleShare}
                className="cdr-action-btn"
                title="Share"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Row 2: Full-width Dua Occasion / Context Title (spans 100% of the card) */}
          {dua.desc && (
            <div className="cdr-dua-desc-row">
              <p className="cdr-dua-desc-text">
                {dua.desc.trim()}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="cdr-card-body p-4 sm:p-6 md:p-8">
          {/* Full-width Context & Timing Callout (for detailed notes > 40 chars) */}
          {dua.hint && dua.hint.trim().length > 40 && (
            <div className="cdr-instruction-callout">
              <div className="cdr-instruction-icon-wrap">
                <Sparkles size={16} />
              </div>
              <div className="cdr-instruction-body">
                <span className="cdr-instruction-label">
                  സമയം & നിർദ്ദേശം
                </span>
                <p className="cdr-instruction-text">
                  {dua.hint.trim()}
                </p>
              </div>
            </div>
          )}

          <div className="cdr-arabic-wrap mb-6 sm:mb-8">
            <p 
              className="cdr-arabic-text text-2xl sm:text-4xl md:text-5xl font-arabic text-slate-800 leading-[2.3] sm:leading-[2.5] text-right break-words" 
              dir="rtl" 
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {dua.dua}
            </p>
          </div>

          <AudioPlayer url={dua.audio_url} isCurrentSlide={isCurrentSlide} />
          <hr className="cdr-divider my-6 sm:my-8 border-slate-100" />

          <div className="mb-6">
            <h4 className="cdr-section-title text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">
              Translation
            </h4>
            <p className="cdr-trans-p text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-line font-malayalam break-words">
              {dua.trans}
            </p>
          </div>

          {dua.transli && (
            <div className="cdr-transli-box mb-6 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
              <h4 className="cdr-transli-title text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Transliteration
              </h4>
              <p className="cdr-transli-p text-sm sm:text-base text-slate-600 italic break-words leading-relaxed">
                "{dua.transli}"
              </p>
            </div>
          )}

          <WordByWordAccordion words={dua.word_by_word} />

          <div className="cdr-meta-grid mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {dua.ref && (
              <div className="cdr-ref-box bg-emerald-50/50 p-3.5 sm:p-4 rounded-xl border border-emerald-100 min-w-0">
                <div className="cdr-ref-title flex items-center gap-2 text-emerald-800 font-medium mb-1">
                  <BookOpen size={16} className="flex-shrink-0" />
                  <span className="text-sm">Reference</span>
                </div>
                <p className="cdr-ref-p text-slate-700 text-sm break-words leading-relaxed">{dua.ref}</p>
              </div>
            )}
            
            {dua.desc && (
              <div className="cdr-virtue-box bg-amber-50/50 p-3.5 sm:p-4 rounded-xl border border-amber-100 min-w-0">
                <div className="cdr-virtue-title flex items-center gap-2 text-amber-800 font-medium mb-1">
                  <Info size={16} className="flex-shrink-0" />
                  <span className="text-sm">Virtue / Info</span>
                </div>
                <p className="cdr-virtue-p text-slate-700 text-sm break-words leading-relaxed">{dua.desc}</p>
              </div>
            )}
          </div>

          {/* Hadith Commentary (if available) */}
          {dua.dua_hadith && dua.dua_hadith.filter(h => h.hadith && h.hadith.trim() !== "").map((h, hIdx) => (
            <div 
              key={hIdx} 
              style={{ 
                marginTop: '1rem', 
                background: 'rgba(236, 253, 245, 0.75)', 
                padding: '0.875rem 1rem', 
                borderRadius: '0.75rem', 
                border: '1px solid #A7F3D0',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                minWidth: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', fontFamily: 'var(--font-malayalam, sans-serif)', flexWrap: 'wrap' }}>
                <BookOpen size={16} style={{ flexShrink: 0 }} />
                <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{h.title || "ഹദീസ് വിവരണം"}</span>
              </div>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.875rem', lineHeight: 1.6, fontFamily: 'var(--font-malayalam, sans-serif)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {h.hadith}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN CATEGORY DUA READER COMPONENT ---
export default function CategoryDuaReader({
  initialView = 'categories', // 'categories' | 'reading'
  initialCategory = null,
  initialSubcategory = null,
  initialIndex = 0,
  onBackToHome = null,
  favorites = [],
  onToggleFavorite = null
}) {
  const [view, setView] = useState(initialView);
  
  // Reading Mode State
  const [activeDuas, setActiveDuas] = useState(() => {
    if (initialSubcategory && initialSubcategory.duas && initialSubcategory.duas.length > 0) {
      return initialSubcategory.duas;
    }
    const defaultSub = CATEGORIES_DATA[0]?.subcategories?.[0];
    return defaultSub ? defaultSub.duas : [];
  });

  const [breadcrumb, setBreadcrumb] = useState(() => ({
    category: initialCategory?.name || CATEGORIES_DATA[0]?.name || "നമസ്കാരം",
    subcategory: initialSubcategory?.name || CATEGORIES_DATA[0]?.subcategories?.[0]?.name || "നമസ്കാരത്തിലെ പ്രാരംഭ പ്രാർത്ഥന"
  }));

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [expandedCatId, setExpandedCatId] = useState(initialCategory?.id || CATEGORIES_DATA[0]?.id || null);

  // Sync if initial props change
  useEffect(() => {
    if (initialSubcategory && initialSubcategory.duas && initialSubcategory.duas.length > 0) {
      setActiveDuas(initialSubcategory.duas);
      setBreadcrumb({
        category: initialCategory?.name || "നമസ്കാരം",
        subcategory: initialSubcategory.name
      });
      setCurrentIndex(initialIndex || 0);
      setView('reading');
    }
  }, [initialSubcategory, initialCategory, initialIndex]);

  useEffect(() => {
    if (initialCategory) {
      setExpandedCatId(initialCategory.id);
      if (initialView === 'categories') {
        setView('categories');
      }
    }
  }, [initialCategory, initialView]);

  // --- Handlers for Category View ---
  const handleCategoryClick = (catId) => {
    setExpandedCatId(expandedCatId === catId ? null : catId);
  };

  const openSubcategory = (category, subcategory) => {
    if (subcategory.duas.length === 0) return; // Prevent opening empty ones
    
    setBreadcrumb({ category: category.name, subcategory: subcategory.name });
    setActiveDuas(subcategory.duas);
    setCurrentIndex(0);
    setView('reading');
  };

  const openAllDuas = (category) => {
    const allDuas = (category.subcategories || []).flatMap(s => (s.duas || []).map(d => ({
      ...d,
      subcategoryName: s.name
    })));
    if (allDuas.length === 0) return;
    setBreadcrumb({ category: category.name, subcategory: category.name });
    setActiveDuas(allDuas);
    setCurrentIndex(0);
    setView('reading');
  };

  // --- Bulletproof Swipe Gesture Detection for Reading View ---
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchMoveRef = useRef({ x: 0, y: 0, moved: false });
  const isSwipeIgnoredRef = useRef(false);

  // Exclude interactive elements so taps/drags on controls never trigger page navigation
  const isInteractiveElement = (target) => {
    if (!target) return false;
    return !!target.closest(
      'button, [role="button"], input, [role="progressbar"], .cdr-audio-player, audio, .cdr-action-btn, .cdr-wbw-toggle, .cdr-wbw-card, a, select, textarea, .no-swipe'
    );
  };

  const onTouchStart = (e) => {
    // If touch begins on audio player, controls, buttons, or inputs, completely disable swipe
    if (isInteractiveElement(e.target)) {
      isSwipeIgnoredRef.current = true;
      return;
    }

    isSwipeIgnoredRef.current = false;
    const touch = e.touches[0] || e.targetTouches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      moved: false
    };
  };

  const onTouchMove = (e) => {
    if (isSwipeIgnoredRef.current) return;
    const touch = e.touches[0] || e.targetTouches[0];
    if (!touch) return;

    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      moved: true
    };
  };

  const onTouchEnd = () => {
    if (isSwipeIgnoredRef.current) {
      isSwipeIgnoredRef.current = false;
      return;
    }

    // A tap without intentional dragging should NEVER flip the page
    if (!touchMoveRef.current.moved) return;

    const diffX = touchStartRef.current.x - touchMoveRef.current.x;
    const diffY = touchStartRef.current.y - touchMoveRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Reset moved flag
    touchMoveRef.current.moved = false;

    // Minimum distance threshold to confirm intentional swipe (60px)
    const minSwipeDistance = 60;

    // Horizontal movement must dominate vertical movement by at least 1.5x (prevents vertical scrolling conflict)
    const isHorizontalSwipe = Math.abs(diffX) >= minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * 1.5;

    // Must be completed within a reasonable gesture duration (< 800ms)
    if (isHorizontalSwipe && duration < 800) {
      if (diffX > 0 && currentIndex < activeDuas.length - 1) {
        // Swiped Left -> Go to Next Dua
        setCurrentIndex(prev => prev + 1);
      } else if (diffX < 0 && currentIndex > 0) {
        // Swiped Right -> Go to Previous Dua
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleBackToHomeOrCategories = useCallback(() => {
    if (view === 'reading' && initialView === 'categories') {
      setView('categories');
    } else if (onBackToHome) {
      onBackToHome();
    } else {
      setView('categories');
    }
  }, [view, initialView, onBackToHome]);

  // Handle mobile hardware / system back button (prevents closing the app)
  useEffect(() => {
    const unregister = registerBackButtonHandler(() => {
      handleBackToHomeOrCategories();
      return true;
    }, 100);
    return unregister;
  }, [handleBackToHomeOrCategories]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'reading') return;
      if (e.key === 'ArrowRight' && currentIndex < activeDuas.length - 1) setCurrentIndex(prev => prev + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(prev => prev - 1);
      if (e.key === 'Escape') handleBackToHomeOrCategories();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, view, activeDuas.length, handleBackToHomeOrCategories]);

  return (
    <div className="cdr-container h-full w-full bg-slate-100 flex flex-col font-sans overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');`}</style>
      
      {/* ------------------------------- */}
      {/* SCREEN 1: CATEGORY SELECTION UI */}
      {/* ------------------------------- */}
      {view === 'categories' && (
        <>
          <header className="cdr-cat-header bg-emerald-800 text-white shadow-md z-10 p-5 text-center relative">
            {onBackToHome && (
              <button 
                onClick={onBackToHome}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="തിരികെ പോവുക"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold">
              {initialCategory ? initialCategory.name : "مناجاة"}
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              {initialCategory 
                ? (initialCategory.nameArabic || "വിഭാഗത്തിലെ പ്രാർത്ഥനകൾ") 
                : "Select a category to begin reading"}
            </p>
          </header>

          <main className="cdr-cat-main flex-1 p-4 max-w-3xl mx-auto w-full">
            <div className="cdr-cat-list flex flex-col gap-4">
              {(initialCategory ? [initialCategory] : CATEGORIES_DATA).map(cat => {
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
                    {/* Category Header */}
                    <button 
                      onClick={() => handleCategoryClick(cat.id)}
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
                            {cat.name?.includes('ഖുർആൻ') ? <BookOpen size={22} /> : <Folder size={22} />}
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
                            <span>{cat.subcategories.length} ഉപവിഭാഗങ്ങൾ</span>
                            <span className="cdr-cat-meta-dot">•</span>
                            <span>{totalDuas} പ്രാർത്ഥനകൾ</span>
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
                        {totalDuas > 0 && (
                          <button
                            type="button"
                            onClick={() => openAllDuas(cat)}
                            className="cdr-read-all-btn"
                          >
                            <div className="cdr-read-all-icon-wrap">
                              <Sparkles size={18} />
                            </div>
                            <div className="cdr-read-all-text">
                              <span className="cdr-read-all-title">എല്ലാ പ്രാർത്ഥനകളും വായിക്കുക</span>
                              <span className="cdr-read-all-sub">{totalDuas} പ്രാർത്ഥനകൾ ഒരുമിച്ച് വായിക്കാം</span>
                            </div>
                            <ChevronRight size={18} className="cdr-read-all-arrow" />
                          </button>
                        )}
                        {cat.subcategories.length > 0 ? (
                          <div className="cdr-cat-sublist">
                            {cat.subcategories.map((sub, sIdx) => (
                              <button 
                                key={sub.id}
                                onClick={() => openSubcategory(cat, sub)}
                                className="cdr-subcat-btn"
                              >
                                <div className="cdr-subcat-left">
                                  <span className="cdr-subcat-num">{sIdx + 1}</span>
                                  <span className="cdr-subcat-name">{sub.name}</span>
                                </div>
                                <div className="cdr-subcat-meta">
                                  <span className="cdr-subcat-badge">
                                    {sub.duas.length} ദുആകൾ
                                  </span>
                                  <ChevronRight size={16} className="cdr-subcat-chevron" />
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="cdr-empty-subcat">
                            ഉപവിഭാഗങ്ങൾ ലഭ്യമല്ല.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}

      {/* ------------------------------- */}
      {/* SCREEN 2: DUA SWIPING READER UI */}
      {/* ------------------------------- */}
      {view === 'reading' && (
        <>
          <header className="cdr-reader-header bg-emerald-800 text-white shadow-md z-10 relative flex-shrink-0">
            <div className="cdr-reader-header-inner max-w-4xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between">
              <div className="cdr-reader-header-left flex items-center gap-3 min-w-0 flex-1 pr-2">
                <button 
                  onClick={handleBackToHomeOrCategories}
                  className="cdr-back-btn p-1.5 bg-emerald-700/50 hover:bg-emerald-700 rounded-full transition-colors flex-shrink-0"
                  aria-label={onBackToHome ? "Back to Home" : "Back to Categories"}
                  title={onBackToHome ? "ഹോം പേജിലേക്ക് മടങ്ങുക" : "വിഭാഗങ്ങളിലേക്ക് മടങ്ങുക"}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="cdr-reader-title text-base sm:text-lg font-bold truncate">{breadcrumb.subcategory}</h1>
                  <div className="cdr-reader-subtitle text-emerald-200 text-xs font-medium truncate">
                    {breadcrumb.category}
                  </div>
                </div>
              </div>
              
              {/* Pagination Desktop */}
              <div className="cdr-desktop-page-pill hidden sm:flex items-center gap-1.5 bg-emerald-900/60 py-1 px-3 rounded-full text-emerald-100 text-xs font-semibold border border-emerald-700/40 flex-shrink-0">
                <span>Page {currentIndex + 1} of {activeDuas.length}</span>
              </div>
            </div>
          </header>

          <main 
            className="cdr-swiper-main flex-1 min-h-0 relative overflow-hidden flex bg-slate-100"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div 
              className="cdr-slider-track flex flex-row w-full h-full transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {activeDuas.map((dua, idx) => {
                const targetId = `prayer-${dua.id}`;
                const isFav = (favorites || []).some(f => {
                  const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
                  return fId === String(dua.id) || 
                         fId === targetId || 
                         (dua.originalId && fId === String(dua.originalId));
                });
                return (
                  <div key={dua.id} className="cdr-slide-wrapper w-full h-full flex-shrink-0">
                    <DuaCard 
                      dua={dua} 
                      currentPage={idx + 1} 
                      totalPages={activeDuas.length}
                      isCurrentSlide={currentIndex === idx}
                      isBookmarked={isFav}
                      onToggleBookmark={onToggleFavorite}
                    />
                  </div>
                );
              })}
            </div>

            {/* Desktop Navigation Arrows */}
            <button 
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
              className={`cdr-arrow-btn prev absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg border border-slate-200 bg-white text-slate-700 hidden sm:block transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-slate-50 hover:text-emerald-600'}`}
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === activeDuas.length - 1}
              className={`cdr-arrow-btn next absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg border border-slate-200 bg-white text-slate-700 hidden sm:block transition-all ${currentIndex === activeDuas.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-slate-50 hover:text-emerald-600'}`}
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </main>

          {/* Mobile Bottom Navigation Bar - Clean Page Number Pill (Replaces arrows & dots) */}
          <div className="cdr-mobile-bottom-bar sm:hidden flex-shrink-0 bg-white border-t border-slate-200/80 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-20 pb-safe">
            <div className="cdr-mobile-bottom-inner flex items-center justify-center px-4 py-2.5">
              <div className="cdr-page-number-pill">
                <span>Page {currentIndex + 1} of {activeDuas.length}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
