import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Copy, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Share2, 
  Info,
  ArrowLeft,
  Folder,
  Sparkles,
  BookMarked,
  SkipBack,
  SkipForward
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
      className="cdr-audio-pill"
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
        className="cdr-audio-circle-btn"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
      </button>
      <div 
        className="cdr-audio-track-wrap" 
        onClick={handleSeek}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        role="progressbar"
      >
        <div className="cdr-audio-track">
          <div 
            className="cdr-audio-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button 
        type="button"
        className="cdr-audio-vol-btn"
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

// --- MULTI-CARD DUA DISPLAY COMPONENT ---
const DuaMultiCard = ({ 
  dua, 
  duaNumber,
  isCurrentSlide,
  isBookmarked,
  onToggleBookmark
}) => {
  const [localBookmarked, setLocalBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wbwOpen, setWbwOpen] = useState(false);

  if (!dua) return null;

  const bookmarkedStatus = isBookmarked !== undefined ? isBookmarked : localBookmarked;

  const handleCopy = () => {
    const textParts = [dua.dua, dua.trans, dua.ref].filter(Boolean);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textParts.join('\n\n'));
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const textParts = [dua.dua, dua.trans, dua.ref].filter(Boolean);
    const text = textParts.join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${duaNumber || dua.id}`,
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
    <div className="cdr-cards-column">
      {/* ═══════ CARD 1: Main Dua (Arabic + Audio Player) ═══════ */}
      <div className="cdr-card-main-glass">
        <div className="cdr-card-shine-top"></div>
        
        <div className="cdr-card-relative-content">
          {/* Header: Badge & Icons */}
          <div className="cdr-card-top-row">
            <div className="cdr-card-dua-badge">
              {duaNumber ? `${duaNumber}` : (dua.id ? `DUA #${dua.id}` : 'DUA')}
            </div>
            <div 
              className="cdr-card-action-group"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleCopy} 
                className="cdr-icon-btn" 
                title="Copy Dua"
                aria-label="Copy Dua"
              >
                <Copy size={20} />
                {copied && (
                  <span className="cdr-copied-pill">
                    Copied!
                  </span>
                )}
              </button>
              <button 
                onClick={handleBookmarkClick} 
                className={`cdr-icon-btn ${bookmarkedStatus ? 'bookmarked' : ''}`}
                title={bookmarkedStatus ? "Remove Bookmark" : "Bookmark Dua"}
                aria-label="Bookmark"
              >
                {bookmarkedStatus ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
              </button>
              <button 
                onClick={handleShare} 
                className="cdr-icon-btn" 
                title="Share"
                aria-label="Share"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Malayalam Instruction / Occasion Text */}
          {dua.desc && dua.desc.trim().length > 0 && (
            <div className="cdr-card-desc-text">
              {dua.desc.trim()}
            </div>
          )}

          {/* Short hint badge if exists */}
          {dua.hint && dua.hint.trim().length > 0 && dua.hint.trim().length <= 40 && (
            <div className="cdr-card-hint-pill">
              <Sparkles size={14} className="cdr-hint-sparkle" />
              <span>{dua.hint.trim()}</span>
            </div>
          )}

          {/* Detailed instruction callout if hint > 40 chars */}
          {dua.hint && dua.hint.trim().length > 40 && (
            <div className="cdr-card-callout">
              <div className="cdr-callout-icon-wrap">
                <Sparkles size={16} />
              </div>
              <div className="cdr-callout-body">
                <span className="cdr-callout-label">
                  സമയം & നിർദ്ദേശം
                </span>
                <p className="cdr-callout-text">
                  {dua.hint.trim()}
                </p>
              </div>
            </div>
          )}

          {/* Arabic Dua */}
          {dua.dua && (
            <div className="cdr-card-arabic" dir="rtl">
              {dua.dua}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ CARD 2: Translation ═══════ */}
      {dua.trans && dua.trans.trim().length > 0 && (
        <div className="cdr-card-trans-glass">
          <h3 className="cdr-trans-heading">TRANSLATION</h3>
          <p className="cdr-trans-body">
            {dua.trans}
          </p>
        </div>
      )}

      {/* ═══════ CARD 3: Transliteration (Separate Glass Card) ═══════ */}
      {dua.transli && dua.transli.trim().length > 0 && (
        <div className="cdr-card-transli-glass">
          <h3 className="cdr-transli-heading">TRANSLITERATION</h3>
          <p className="cdr-transli-body">
            "{dua.transli}"
          </p>
        </div>
      )}

      {/* ═══════ CARD 4: Word by Word Meaning (Accordion) ═══════ */}
      {Array.isArray(dua.word_by_word) && dua.word_by_word.length > 0 && (
        <div className="cdr-card-wbw-glass">
          <div 
            onClick={() => setWbwOpen(!wbwOpen)}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="cdr-wbw-toggle-row"
            role="button"
            tabIndex={0}
          >
            <div className="cdr-wbw-left-info">
              <div className="cdr-wbw-icon-wrap">
                <BookMarked size={20} />
              </div>
              <div className="cdr-wbw-text-wrap">
                <span className="cdr-wbw-main-title">Word by Word Meaning</span>
                <span className="cdr-wbw-sub-title">(പദാനുപദ അർത്ഥം)</span>
              </div>
            </div>
            <div className="cdr-wbw-right-info">
              <span className="cdr-wbw-pill-badge">
                {dua.word_by_word.length} പദങ്ങൾ
              </span>
              <div className="cdr-wbw-chevron-wrap">
                {wbwOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
          </div>

          {wbwOpen && (
            <div className="cdr-wbw-grid-box">
              {dua.word_by_word.map((word, idx) => (
                <div key={idx} className="cdr-wbw-word-tile">
                  <span className="cdr-wbw-ar-text" dir="rtl">{word?.ar || ''}</span>
                  <span className="cdr-wbw-ml-text">{word?.ml || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════ CARD 5: Reference ═══════ */}
      {dua.ref && dua.ref.trim().length > 0 && (
        <div className="cdr-card-ref-glass">
          <div className="cdr-ref-header-row">
            <BookOpen size={20} />
            <h3 className="cdr-ref-heading">Reference</h3>
          </div>
          <p className="cdr-ref-body-text" dir="rtl">
            {dua.ref}
          </p>
        </div>
      )}

      {/* ═══════ CARD 6: Virtue / Info ═══════ */}
      {dua.desc && dua.desc.trim().length > 0 && (
        <div className="cdr-card-virtue-glass">
          <div className="cdr-virtue-header-row">
            <Info size={20} />
            <h3 className="cdr-virtue-heading">Virtue / Info</h3>
          </div>
          <p className="cdr-virtue-body-text">
            {dua.desc}
          </p>
        </div>
      )}

      {/* ═══════ CARD 7: Hadith Commentary (if available) ═══════ */}
      {Array.isArray(dua.dua_hadith) && dua.dua_hadith.filter(h => h && h.hadith && h.hadith.trim() !== "").map((h, hIdx) => (
        <div key={hIdx} className="cdr-card-ref-glass">
          <div className="cdr-ref-header-row">
            <BookOpen size={20} />
            <h3 className="cdr-ref-heading">{h.title || "ഹദീസ് വിവരണം"}</h3>
          </div>
          <p className="cdr-ref-body-text">
            {h.hadith}
          </p>
        </div>
      ))}
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
  onToggleFavorite = null,
  onViewChange = null
}) {
  const [view, setView] = useState(initialView);
  
  // Sticky Curved Bottom Audio Player State
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioVolume, setAudioVolume] = useState(85);
  const stickyAudioRef = useRef(null);
  const lastReportedViewRef = useRef('');

  // Notify parent of reading view state & update body class for bottom nav hiding
  useEffect(() => {
    if (view === 'reading') {
      document.body.classList.add('dua-page-active');
    } else {
      document.body.classList.remove('dua-page-active');
    }

    if (lastReportedViewRef.current !== view) {
      lastReportedViewRef.current = view;
      if (typeof onViewChange === 'function') {
        onViewChange(view);
      }
    }

    return () => {
      document.body.classList.remove('dua-page-active');
    };
  }, [view, onViewChange]);
  
  // Reading Mode State
  const [activeDuas, setActiveDuas] = useState(() => {
    if (initialSubcategory && initialSubcategory.duas && initialSubcategory.duas.length > 0) {
      return initialSubcategory.duas;
    }
    if (initialCategory) {
      if (initialCategory.subcategories?.length === 1 && initialCategory.subcategories[0]?.duas?.length > 0) {
        return initialCategory.subcategories[0].duas;
      }
      const allDuas = (initialCategory.subcategories || []).flatMap(s => s.duas || []);
      if (allDuas.length > 0) return allDuas;
    }
    const defaultSub = CATEGORIES_DATA[0]?.subcategories?.[0];
    return defaultSub ? defaultSub.duas : [];
  });

  const [breadcrumb, setBreadcrumb] = useState(() => {
    if (initialSubcategory) {
      return {
        category: initialCategory?.name || "നമസ്കാരം",
        subcategory: initialSubcategory.name
      };
    }
    if (initialCategory) {
      const firstSub = initialCategory.subcategories?.[0];
      return {
        category: initialCategory.name,
        subcategory: firstSub ? firstSub.name : initialCategory.name
      };
    }
    return {
      category: CATEGORIES_DATA[0]?.name || "നമസ്കാരം",
      subcategory: CATEGORIES_DATA[0]?.subcategories?.[0]?.name || "നമസ്കാരത്തിലെ പ്രാരംഭ പ്രാർത്ഥന"
    };
  });

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [expandedCatId, setExpandedCatId] = useState(initialCategory?.id || CATEGORIES_DATA[0]?.id || null);

  // Format seconds into mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDua = activeDuas[currentIndex] || {};
  const currentAudioUrl = currentDua?.audio_url 
    ? (String(currentDua.audio_url).startsWith('http') ? String(currentDua.audio_url) : `${AUDIO_BASE}${currentDua.audio_url}.mp3`) 
    : null;

  // Sync audio with current Dua: Only the Dua in the page plays
  useEffect(() => {
    if (!stickyAudioRef.current) return;

    if (!currentAudioUrl) {
      stickyAudioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTimeSec(0);
      setDurationSec(0);
      return;
    }

    const wasPlaying = isPlaying;
    stickyAudioRef.current.src = currentAudioUrl;
    stickyAudioRef.current.playbackRate = playbackSpeed;
    stickyAudioRef.current.volume = audioVolume / 100;
    setAudioProgress(0);
    setCurrentTimeSec(0);

    if (wasPlaying) {
      stickyAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentAudioUrl]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (stickyAudioRef.current) {
        stickyAudioRef.current.pause();
        stickyAudioRef.current.src = '';
        stickyAudioRef.current = null;
      }
    };
  }, []);

  const toggleStickyPlay = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault?.();
    }
    if (!currentAudioUrl) return;

    if (!stickyAudioRef.current) {
      const audio = new Audio(currentAudioUrl);
      audio.playbackRate = playbackSpeed;
      audio.volume = audioVolume / 100;

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDurationSec(audio.duration);
        }
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setCurrentTimeSec(audio.currentTime);
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
        setCurrentTimeSec(0);
      });

      stickyAudioRef.current = audio;
    }

    if (isPlaying) {
      stickyAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      stickyAudioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!stickyAudioRef.current || !stickyAudioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newTime = (pct / 100) * stickyAudioRef.current.duration;
    stickyAudioRef.current.currentTime = newTime;
    setCurrentTimeSec(newTime);
    setAudioProgress(pct);
  };

  const toggleSpeed = (e) => {
    e.stopPropagation();
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (stickyAudioRef.current) {
      stickyAudioRef.current.playbackRate = newSpeed;
    }
  };

  const handleVolumeChange = (newVal) => {
    setAudioVolume(newVal);
    if (stickyAudioRef.current) {
      stickyAudioRef.current.volume = newVal / 100;
    }
  };

  const changeDua = (dir) => {
    if (dir === 'next' && currentIndex < activeDuas.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (dir === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const subcategoryTitle = breadcrumb?.subcategory 
    ? String(breadcrumb.subcategory).trim() 
    : 'DRESSING';

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
      if (!initialSubcategory) {
        const allDuas = (initialCategory.subcategories || []).flatMap(s => s.duas || []);
        if (allDuas.length > 0) {
          setActiveDuas(allDuas);
          const firstSub = initialCategory.subcategories?.[0];
          setBreadcrumb({
            category: initialCategory.name,
            subcategory: initialCategory.subcategories?.length === 1 && firstSub ? firstSub.name : initialCategory.name
          });
        }
      }
      if (initialView === 'categories') {
        setView('categories');
      }
    }
  }, [initialCategory, initialView, initialSubcategory]);

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
      'button, [role="button"], input, [role="progressbar"], .cdr-audio-pill, audio, .cdr-icon-btn, a, select, textarea, .no-swipe, .sticky-player'
    );
  };

  const onTouchStart = (e) => {
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

    if (!touchMoveRef.current.moved) return;

    const diffX = touchStartRef.current.x - touchMoveRef.current.x;
    const diffY = touchStartRef.current.y - touchMoveRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    touchMoveRef.current.moved = false;

    const minSwipeDistance = 60;
    const isHorizontalSwipe = Math.abs(diffX) >= minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * 1.5;

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
    if (stickyAudioRef.current) {
      stickyAudioRef.current.pause();
      setIsPlaying(false);
    }
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
      if (isPlayerExpanded) {
        setIsPlayerExpanded(false);
        return true;
      }
      handleBackToHomeOrCategories();
      return true;
    }, 100);
    return unregister;
  }, [handleBackToHomeOrCategories, isPlayerExpanded]);

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

  // Keep active pill scrolled into view in pagination bar
  const pillBarRef = useRef(null);
  useEffect(() => {
    if (view === 'reading' && pillBarRef.current) {
      const activeEl = pillBarRef.current.querySelector('.cdr-number-pill.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, view]);

  return (
    <div className="cdr-container">
      {/* Global Fonts and Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap');
      `}} />

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
                        {isOpen ? <ChevronUp size={16} strokeWidth={2.4} /> : <ChevronDown size={16} strokeWidth={2.4} />}
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
      {/* SCREEN 2: DUA READING VIEW     */}
      {/* ------------------------------- */}
      {view === 'reading' && (
        <div className="cdr-reading-root">
          {/* Animated Aurora Background Blobs */}
          <div className="cdr-aurora-blob cdr-aurora-blob-1"></div>
          <div className="cdr-aurora-blob cdr-aurora-blob-2"></div>
          <div className="cdr-aurora-blob cdr-aurora-blob-3"></div>

          {/* Sticky Top Navigation Bar */}
          <nav className="cdr-glass-nav">
            <div className="cdr-glass-nav-inner">
              <button 
                onClick={handleBackToHomeOrCategories}
                className="cdr-glass-back-btn"
                aria-label={onBackToHome ? "Back to Home" : "Back to Categories"}
                title={onBackToHome ? "ഹോം പേജിലേക്ക് മടങ്ങുക" : "വിഭാഗങ്ങളിലേക്ക് മടങ്ങുക"}
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="cdr-glass-nav-titles">
                <h1 className="cdr-glass-nav-title">{breadcrumb.subcategory}</h1>
                <p className="cdr-glass-nav-subtitle">{breadcrumb.category}</p>
              </div>
            </div>
          </nav>

          {/* Horizontal Number Pagination */}
          <div className="cdr-number-capsule-wrapper">
            <div ref={pillBarRef} className="cdr-number-capsule-bar cdr-no-scrollbar">
              {activeDuas.map((_, i) => (
                <button
                  key={i} 
                  onClick={() => setCurrentIndex(i)}
                  className={`cdr-number-pill ${currentIndex === i ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Main Scrollable Content Container */}
          <main 
            className="cdr-reading-scroll-area cdr-no-scrollbar"
            style={{
              paddingBottom: isPlayerExpanded ? '300px' : '96px'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {activeDuas[currentIndex] && (
              <DuaMultiCard 
                dua={activeDuas[currentIndex]}
                duaNumber={currentIndex + 1}
                isCurrentSlide={true}
                isBookmarked={(favorites || []).some(f => {
                  const fId = typeof f === 'object' && f !== null ? String(f.id) : String(f);
                  const d = activeDuas[currentIndex];
                  return fId === String(d.id) || (d.originalId !== undefined && fId === String(d.originalId));
                })}
                onToggleBookmark={onToggleFavorite}
              />
            )}
          </main>

          {/* Backdrop Dimmer when Audio Player is Expanded */}
          {isPlayerExpanded && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 45,
                transition: 'opacity 0.25s ease'
              }}
              onClick={() => setIsPlayerExpanded(false)}
            />
          )}

          {/* ========================================================
              STICKY CURVED BOTTOM AUDIO PLAYER SHEET
              Matches Reference Image: media_1794030845933_94d9d71c.png
              Glassmorphism + clean curved edges
              ======================================================== */}
          <div 
            className="sticky-player"
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '540px',
              zIndex: 50,
              borderTopLeftRadius: '2.25rem',
              borderTopRightRadius: '2.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.95)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.85)',
              borderRight: '1px solid rgba(255, 255, 255, 0.85)',
              borderBottom: 'none',
              boxShadow: '0 -10px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              height: isPlayerExpanded ? '280px' : '76px',
              transition: 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
              userSelect: 'none'
            }}
          >
            {/* Drag Handle Pill */}
            <div 
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '12px',
                paddingBottom: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
              title={isPlayerExpanded ? "Collapse" : "Expand"}
            >
              <div 
                style={{
                  width: '44px',
                  height: '5px',
                  backgroundColor: '#CBD5E1',
                  borderRadius: '9999px'
                }}
              />
            </div>

            {/* CASE A: COLLAPSED VIEW (Sticky Bottom Docked Bar) */}
            {!isPlayerExpanded && (
              <div 
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2px 24px 8px',
                  cursor: 'pointer',
                  flex: 1
                }}
                onClick={() => setIsPlayerExpanded(true)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, marginRight: '12px' }}>
                  <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '14px', lineHeight: 1.2 }}>
                    Dua {currentIndex + 1}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0D9488', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {subcategoryTitle}
                  </span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStickyPlay(e);
                  }}
                  style={{
                    width: '46px',
                    height: '46px',
                    backgroundColor: '#0D9488',
                    borderRadius: '50%',
                    color: '#FFFFFF',
                    boxShadow: '0 6px 16px -2px rgba(13, 148, 136, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                  )}
                </button>
              </div>
            )}

            {/* CASE B: EXPANDED VIEW (Exact Match to User Reference Screenshot) */}
            {isPlayerExpanded && (
              <div 
                style={{
                  padding: '0 24px 12px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Header Title & Subtitle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: '2px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0, lineHeight: 1.2 }}>
                    Dua {currentIndex + 1}
                  </h3>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px', marginBottom: 0 }}>
                    {subcategoryTitle}
                  </p>
                </div>

                {/* Time Stamps and Interactive Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', margin: '8px 0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', minWidth: '32px', textAlign: 'left' }}>
                    {formatTime(currentTimeSec)}
                  </span>
                  
                  <div 
                    style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '9999px',
                      position: 'relative',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={handleSeek}
                    role="progressbar"
                    aria-valuenow={Math.round(audioProgress)}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div 
                      style={{
                        height: '6px',
                        borderRadius: '9999px',
                        backgroundColor: '#0D9488',
                        width: `${audioProgress}%`,
                        position: 'relative',
                        transition: 'width 0.05s linear'
                      }}
                    >
                      {/* Circular Thumb with white fill and teal border */}
                      <div 
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translate(50%, -50%)',
                          width: '14px',
                          height: '14px',
                          backgroundColor: '#FFFFFF',
                          border: '3px solid #0D9488',
                          borderRadius: '50%',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
                        }}
                      />
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', minWidth: '32px', textAlign: 'right' }}>
                    {formatTime(durationSec || 45)}
                  </span>
                </div>

                {/* Main Controls: Previous, Big Play/Pause, Next */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '36px', margin: '2px 0' }}>
                  <button 
                    onClick={() => changeDua('prev')}
                    disabled={currentIndex === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                      color: currentIndex === 0 ? '#CBD5E1' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.15s ease'
                    }}
                    title="Previous Dua"
                    aria-label="Previous Dua"
                  >
                    <SkipBack size={26} strokeWidth={2} />
                  </button>

                  <button 
                    onClick={toggleStickyPlay}
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#0D9488',
                      borderRadius: '50%',
                      color: '#FFFFFF',
                      boxShadow: '0 10px 25px -4px rgba(13, 148, 136, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.1s active'
                    }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={28} fill="currentColor" />
                    ) : (
                      <Play size={28} fill="currentColor" style={{ marginLeft: '3px' }} />
                    )}
                  </button>

                  <button 
                    onClick={() => changeDua('next')}
                    disabled={currentIndex === activeDuas.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      cursor: currentIndex === activeDuas.length - 1 ? 'not-allowed' : 'pointer',
                      color: currentIndex === activeDuas.length - 1 ? '#CBD5E1' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.15s ease'
                    }}
                    title="Next Dua"
                    aria-label="Next Dua"
                  >
                    <SkipForward size={26} strokeWidth={2} />
                  </button>
                </div>

                {/* Bottom Controls: Speed Pill & Volume Slider */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '6px', padding: '0 4px' }}>
                  <button 
                    onClick={toggleSpeed}
                    style={{
                      backgroundColor: '#ECFDF5',
                      color: '#0D9488',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      padding: '6px 14px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {playbackSpeed}x SPEED
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Volume2 size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={audioVolume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      style={{
                        width: '96px',
                        height: '4px',
                        backgroundColor: '#E2E8F0',
                        borderRadius: '9999px',
                        accentColor: '#0D9488',
                        cursor: 'pointer'
                      }}
                      aria-label="Volume"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
