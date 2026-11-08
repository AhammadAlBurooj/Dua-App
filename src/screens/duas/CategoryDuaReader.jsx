import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Copy, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  ChevronDown, 
  ChevronsDown, 
  ChevronUp, 
  ChevronRight, 
  Share2, 
  Info, 
  ArrowLeft, 
  Folder, 
  Sparkles, 
  BookMarked, 
  SkipBack, 
  SkipForward, 
  CheckCircle2, 
  Repeat, 
  RotateCcw
} from 'lucide-react';
import { 
  CATEGORIES_DATA, 
  CATEGORY_THEMES, 
  FLATTENED_SECTIONS, 
  findSectionIndex
} from '../../data/categoriesData';
import { registerBackButtonHandler } from '../../utils/backButtonManager';
import './CategoryDuaReader.css';

const AUDIO_BASE = 'https://crimson-cell-3d4c.mubarakar95.workers.dev/';

// --- MULTI-CARD DUA DISPLAY COMPONENT ---
const DuaMultiCard = ({ 
  dua, 
  duaNumber,
  isCurrentSlide: _isCurrentSlide,
  isBookmarked,
  onToggleBookmark
}) => {
  const [localBookmarked, setLocalBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wbwOpen, setWbwOpen] = useState(false);
  const [virtueOpen, setVirtueOpen] = useState(false);
  const [arabicZoom, setArabicZoom] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const pinchRef = useRef({ initialDist: 0, initialZoom: 1, isPinching: false });

  const handleArabicTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.stopPropagation();
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      pinchRef.current = {
        initialDist: dist,
        initialZoom: arabicZoom,
        isPinching: true
      };
      setIsPinching(true);
    }
  };

  const handleArabicTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current.isPinching) {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (pinchRef.current.initialDist > 0) {
        const factor = dist / pinchRef.current.initialDist;
        const newZoom = Math.min(Math.max(pinchRef.current.initialZoom * factor, 0.75), 2.2);
        setArabicZoom(parseFloat(newZoom.toFixed(2)));
      }
    }
  };

  const handleArabicTouchEnd = (e) => {
    if (pinchRef.current.isPinching) {
      if (e.touches.length < 2) {
        pinchRef.current.isPinching = false;
        setIsPinching(false);
      }
    }
  };

  const handleArabicWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setArabicZoom((prev) => {
        const next = Math.min(Math.max(prev + delta, 0.75), 2.2);
        return parseFloat(next.toFixed(2));
      });
    }
  };

  useEffect(() => {
    setVirtueOpen(false);
  }, [dua?.id]);

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
      } catch {
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
          
          {/* Header: Info, Count Pill, Copy, Bookmark, Share in a single row */}
          <div className="cdr-card-top-row">
            <div className="cdr-card-top-left-group">
              {dua.desc && dua.desc.trim().length > 0 && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVirtueOpen(!virtueOpen);
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className={`cdr-virtue-toggle-btn ${virtueOpen ? 'open' : ''}`}
                  aria-expanded={virtueOpen}
                  title={virtueOpen ? "Collapse Info" : "Expand Info"}
                >
                  <div className="cdr-virtue-toggle-left">
                    <Info size={14} className="cdr-virtue-toggle-icon" />
                    <span className="cdr-virtue-toggle-label">Info</span>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`cdr-virtue-toggle-chevron ${virtueOpen ? 'rotated' : ''}`} 
                  />
                </button>
              )}

              {dua.hint && dua.hint.trim().length > 0 && dua.hint.trim().length <= 40 && (
                <div className="cdr-card-hint-pill">
                  <Sparkles size={13} className="cdr-hint-sparkle" />
                  <span>{dua.hint.trim()}</span>
                </div>
              )}
            </div>

            <div 
              className="cdr-card-action-group"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {/* Subtle Chrome-style Reset Zoom button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setArabicZoom(1);
                }}
                className={`cdr-icon-btn cdr-zoom-reset-btn ${arabicZoom !== 1 ? 'is-active' : ''}`}
                title={arabicZoom !== 1 ? `Reset Zoom (${Math.round(arabicZoom * 100)}%)` : "Reset Zoom"}
                aria-label="Reset Arabic font zoom"
              >
                <RotateCcw size={17} />
              </button>

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

          {/* Expanded Info Content (Directly below top row across full card width) */}
          {dua.desc && dua.desc.trim().length > 0 && virtueOpen && (
            <div className="cdr-virtue-expanded-box">
              <p className="cdr-virtue-body-text">
                {dua.desc.trim()}
              </p>
            </div>
          )}

          {/* Arabic Dua with Pinch-to-Zoom & Pan support */}
          {dua.dua && (
            <div 
              className="cdr-card-arabic-wrap"
              onTouchStart={handleArabicTouchStart}
              onTouchMove={handleArabicTouchMove}
              onTouchEnd={handleArabicTouchEnd}
              onTouchCancel={handleArabicTouchEnd}
              onWheel={handleArabicWheel}
            >
              <div 
                className={`cdr-card-arabic ${isPinching ? 'is-pinching' : ''}`} 
                dir="rtl"
                style={{
                  fontSize: `calc(34px * ${arabicZoom})`
                }}
              >
                {dua.dua}
              </div>
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
            <div className="cdr-wbw-grid-box" dir="rtl">
              {dua.word_by_word.map((word, idx) => (
                <div key={idx} className="cdr-wbw-word-tile">
                  <span className="cdr-wbw-ar-text" dir="rtl">{word?.ar || ''}</span>
                  <span className="cdr-wbw-ml-text" dir="ltr">{word?.ml || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════ CARD 6: Samayam & Nirdhesham (for detailed instructions) ═══════ */}
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

      {/* ═══════ CARD 7: Hadith Commentary (if available) ═══════ */}
      {Array.isArray(dua.dua_hadith) && dua.dua_hadith.filter(h => h && h.hadith && h.hadith.trim() !== "").map((h, hIdx) => (
        <div key={hIdx} className="cdr-card-ref-glass">
          <div className="cdr-ref-header-row">
            <BookOpen size={20} className="cdr-ref-icon" />
            <h3 className="cdr-ref-heading">{h.title || "ഹദീസ് വിവരണം"}</h3>
          </div>
          <p className="cdr-ref-body-text">
            {h.hadith}
          </p>
        </div>
      ))}

      {/* ═══════ Reference (At the very bottom of Dua content) ═══════ */}
      {dua.ref && dua.ref.trim().length > 0 && (
        <div className="cdr-card-ref-glass">
          <div className="cdr-ref-header-row">
            <BookOpen size={20} className="cdr-ref-icon" />
            <h3 className="cdr-ref-heading">Reference</h3>
          </div>
          <p className="cdr-ref-body-text" dir="rtl">
            {dua.ref}
          </p>
        </div>
      )}
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
  const audioVolume = 85;
  const [isRepeat, setIsRepeat] = useState(false);
  const isRepeatRef = useRef(false);
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
  
  // Reading Mode State & Flattened Continuous Navigation
  const [currentSectionIndex, setCurrentSectionIndex] = useState(() => {
    if (initialSubcategory) {
      const idx = findSectionIndex(
        initialCategory?.name,
        initialSubcategory.name,
        initialSubcategory.id || initialSubcategory.originalId
      );
      if (idx !== -1) return idx;
    }
    if (initialCategory) {
      const idx = findSectionIndex(initialCategory.name, null, null);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const currentSection = FLATTENED_SECTIONS[currentSectionIndex] || FLATTENED_SECTIONS[0] || {};
  const activeDuas = (currentSection?.duas && currentSection.duas.length > 0) 
    ? currentSection.duas 
    : (initialSubcategory?.duas || []);
  const prevSection = currentSectionIndex > 0 ? FLATTENED_SECTIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < FLATTENED_SECTIONS.length - 1 ? FLATTENED_SECTIONS[currentSectionIndex + 1] : null;

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [expandedCatId, setExpandedCatId] = useState(initialCategory?.id || CATEGORIES_DATA[0]?.id || null);

  const categoryTitle = currentSection?.categoryName || initialCategory?.name || "നമസ്കാരം";
  const subcategoryTitle = currentSection?.subcategoryName || initialSubcategory?.name || "പ്രാർത്ഥന";

  // Format seconds into mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDua = activeDuas[currentIndex] || activeDuas[0] || {};
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
    stickyAudioRef.current.loop = isRepeatRef.current;
    stickyAudioRef.current.playbackRate = playbackSpeed;
    stickyAudioRef.current.volume = audioVolume / 100;
    setAudioProgress(0);
    setCurrentTimeSec(0);

    if (wasPlaying) {
      stickyAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentSectionIndex, currentAudioUrl]);

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

  const toggleRepeat = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault?.();
    }
    setIsRepeat(prev => {
      const next = !prev;
      isRepeatRef.current = next;
      if (stickyAudioRef.current) {
        stickyAudioRef.current.loop = next;
      }
      return next;
    });
  };

  const toggleStickyPlay = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault?.();
    }
    if (!currentAudioUrl) return;

    if (!stickyAudioRef.current) {
      const audio = new Audio(currentAudioUrl);
      audio.loop = isRepeatRef.current;
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
        if (isRepeatRef.current) {
          if (stickyAudioRef.current) {
            stickyAudioRef.current.currentTime = 0;
            stickyAudioRef.current.play().catch(() => {});
          }
          return;
        }
        setIsPlaying(false);
        setAudioProgress(0);
        setCurrentTimeSec(0);
        setIsPlayerExpanded(false);
      });

      audio.addEventListener('error', () => {
        setIsPlaying(false);
        setIsPlayerExpanded(false);
      });

      stickyAudioRef.current = audio;
    }

    if (isPlaying) {
      stickyAudioRef.current.pause();
      setIsPlaying(false);
      setIsPlayerExpanded(false);
    } else {
      setIsPlayerExpanded(true);
      stickyAudioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setIsPlayerExpanded(false);
        });
    }
  };

  const handleCollapsedButtonClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault?.();
    }
    if (isPlaying) {
      if (stickyAudioRef.current) {
        stickyAudioRef.current.pause();
      }
      setIsPlaying(false);
      setIsPlayerExpanded(false);
    } else {
      setIsPlayerExpanded(true);
      toggleStickyPlay(e);
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

  // Continuous Navigation across Duas, Subcategories, and Categories
  const changeDua = (dir) => {
    if (dir === 'next') {
      if (currentIndex < activeDuas.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (nextSection) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentIndex(0);
      }
    } else if (dir === 'prev') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (prevSection) {
        const prevIdx = currentSectionIndex - 1;
        setCurrentSectionIndex(prevIdx);
        setCurrentIndex(FLATTENED_SECTIONS[prevIdx].duas.length - 1);
      }
    }
  };

  // Sync if initial props change
  useEffect(() => {
    if (initialSubcategory) {
      const idx = findSectionIndex(
        initialCategory?.name,
        initialSubcategory.name,
        initialSubcategory.id || initialSubcategory.originalId
      );
      if (idx !== -1) {
        setCurrentSectionIndex(idx);
      }
      setCurrentIndex(initialIndex || 0);
      setView('reading');
    }
  }, [initialSubcategory, initialCategory, initialIndex]);

  useEffect(() => {
    if (initialCategory) {
      setExpandedCatId(initialCategory.id);
      if (!initialSubcategory) {
        const idx = findSectionIndex(initialCategory.name, null, null);
        if (idx !== -1) {
          setCurrentSectionIndex(idx);
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
    if (!subcategory.duas || subcategory.duas.length === 0) return;
    const idx = findSectionIndex(
      category.name, 
      subcategory.name, 
      subcategory.id || subcategory.originalId
    );
    if (idx !== -1) {
      setCurrentSectionIndex(idx);
    }
    setCurrentIndex(0);
    setView('reading');
  };

  const openAllDuas = (category) => {
    const idx = findSectionIndex(category.name, null, null);
    if (idx !== -1) {
      setCurrentSectionIndex(idx);
    }
    setCurrentIndex(0);
    setView('reading');
  };

  // --- Continuous Swipe Navigation & Smart Boundary Transition Indicator ---
  const [dragOffset, setDragOffset] = useState(0);

  const [boundaryTransition, setBoundaryTransition] = useState({
    active: false,
    direction: null, // 'next' | 'prev'
    currentSubcategoryName: '',
    targetSubcategoryName: '',
    targetCategoryName: '',
    isCategoryChange: false,
    isEnd: false,
    isBeginning: false,
    progress: 0,
    readyToRelease: false
  });

  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isSwipingHorizontal: false,
    isIgnored: false,
    boundaryActive: false,
    readyToRelease: false,
    direction: null
  });

  const holdProgressIntervalRef = useRef(null);
  const lastSwipeTimeRef = useRef(0);

  const isInteractiveElement = (target) => {
    if (!target) return false;
    return !!target.closest(
      'button, [role="button"], input, [role="progressbar"], .cdr-audio-pill, audio, .cdr-icon-btn, a, select, textarea, .no-swipe, .sticky-player, .cdr-swipe-indicator-card, .audio-player-expanded-dock, .audio-player-collapsed-wrapper'
    );
  };

  const startBoundaryHold = (direction, targetSec, isCatChange, isEnd = false, isBeginning = false) => {
    if (gestureRef.current.boundaryActive) return;
    gestureRef.current.boundaryActive = true;
    gestureRef.current.readyToRelease = false;
    gestureRef.current.direction = direction;

    setBoundaryTransition({
      active: true,
      direction,
      currentSubcategoryName: currentSection?.subcategoryName || subcategoryTitle || '',
      targetSubcategoryName: targetSec?.subcategoryName || '',
      targetCategoryName: targetSec?.categoryName || '',
      isCategoryChange: isCatChange,
      isEnd,
      isBeginning,
      progress: 0,
      readyToRelease: false
    });

    if (holdProgressIntervalRef.current) {
      clearInterval(holdProgressIntervalRef.current);
    }

    const startTime = Date.now();
    const duration = 900; // Hold for ~1 second

    holdProgressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));

      if (pct >= 100) {
        clearInterval(holdProgressIntervalRef.current);
        holdProgressIntervalRef.current = null;
        gestureRef.current.readyToRelease = true;
        setBoundaryTransition(prev => ({
          ...prev,
          progress: 100,
          readyToRelease: true
        }));
        if (window.navigator?.vibrate) {
          try { window.navigator.vibrate(18); } catch {}
        }
      } else {
        setBoundaryTransition(prev => ({
          ...prev,
          progress: pct
        }));
      }
    }, 20);
  };

  const cancelBoundaryHold = useCallback(() => {
    if (holdProgressIntervalRef.current) {
      clearInterval(holdProgressIntervalRef.current);
      holdProgressIntervalRef.current = null;
    }
    gestureRef.current.boundaryActive = false;
    gestureRef.current.readyToRelease = false;
    gestureRef.current.direction = null;

    setBoundaryTransition({
      active: false,
      direction: null,
      currentSubcategoryName: '',
      targetSubcategoryName: '',
      targetCategoryName: '',
      isCategoryChange: false,
      isEnd: false,
      isBeginning: false,
      progress: 0,
      readyToRelease: false
    });
  }, []);

  const handleGestureStart = (clientX, clientY, target) => {
    if (isInteractiveElement(target)) {
      gestureRef.current.isIgnored = true;
      return;
    }

    gestureRef.current = {
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      startTime: Date.now(),
      isSwipingHorizontal: false,
      isIgnored: false,
      boundaryActive: false,
      readyToRelease: false,
      direction: null
    };
  };

  const handleGestureMove = (clientX, clientY) => {
    if (gestureRef.current.isIgnored) return;

    gestureRef.current.currentX = clientX;
    gestureRef.current.currentY = clientY;

    const diffX = clientX - gestureRef.current.startX;
    const diffY = clientY - gestureRef.current.startY;

    // Detect direction lock
    if (!gestureRef.current.isSwipingHorizontal) {
      if (Math.abs(diffY) > 15 && Math.abs(diffY) > Math.abs(diffX)) {
        // Vertical reading scroll -> ignore horizontal swipe
        gestureRef.current.isIgnored = true;
        return;
      }
      if (Math.abs(diffX) > 15 && Math.abs(diffX) > Math.abs(diffY) * 1.1) {
        gestureRef.current.isSwipingHorizontal = true;
      }
    }

    if (!gestureRef.current.isSwipingHorizontal) return;

    // Gentle tactile drag resistance
    const offset = Math.max(-75, Math.min(75, diffX * 0.35));
    setDragOffset(offset);

    // Boundary Detection:
    // 1. Swiping Left at last Dua of subcategory -> Next subcategory
    if (diffX < -35 && currentIndex === activeDuas.length - 1) {
      if (!gestureRef.current.boundaryActive) {
        if (nextSection) {
          const isCatChange = nextSection.categoryId !== currentSection.categoryId;
          startBoundaryHold('next', nextSection, isCatChange);
        } else {
          startBoundaryHold('next', null, false, true, false); // Reached end of app
        }
      }
    }
    // 2. Swiping Right at first Dua of subcategory -> Previous subcategory
    else if (diffX > 35 && currentIndex === 0) {
      if (!gestureRef.current.boundaryActive) {
        if (prevSection) {
          const isCatChange = prevSection.categoryId !== currentSection.categoryId;
          startBoundaryHold('prev', prevSection, isCatChange);
        } else {
          startBoundaryHold('prev', null, false, false, true); // Reached beginning of app
        }
      }
    }
    // 3. User moved finger back toward center -> Cancel boundary hold
    else if (gestureRef.current.boundaryActive && Math.abs(diffX) < 25) {
      cancelBoundaryHold();
    }
  };

  const handleGestureEnd = () => {
    setDragOffset(0);

    if (gestureRef.current.isIgnored) {
      gestureRef.current.isIgnored = false;
      return;
    }

    const diffX = gestureRef.current.currentX - gestureRef.current.startX;
    const wasHorizontal = gestureRef.current.isSwipingHorizontal;
    const wasBoundaryActive = gestureRef.current.boundaryActive;
    const isReady = gestureRef.current.readyToRelease;
    const direction = gestureRef.current.direction;

    // Reset gesture flags immediately to prevent duplicate triggers
    gestureRef.current.isSwipingHorizontal = false;
    gestureRef.current.startX = 0;
    gestureRef.current.currentX = 0;
    gestureRef.current.currentY = 0;
    gestureRef.current.isIgnored = true;

    const now = Date.now();

    // Case 1: Boundary Release
    if (wasBoundaryActive) {
      if (isReady && now - lastSwipeTimeRef.current > 350) {
        lastSwipeTimeRef.current = now;
        // Released after hold was completed: perform navigation!
        if (direction === 'next' && nextSection) {
          setCurrentSectionIndex(prev => prev + 1);
          setCurrentIndex(0);
        } else if (direction === 'prev' && prevSection) {
          const prevIdx = currentSectionIndex - 1;
          setCurrentSectionIndex(prevIdx);
          setCurrentIndex(FLATTENED_SECTIONS[prevIdx].duas.length - 1);
        }
      }
      cancelBoundaryHold();
      return;
    }

    // Case 2: Standard within-subcategory Dua navigation (strictly one step)
    if (wasHorizontal && now - lastSwipeTimeRef.current > 350) {
      if (diffX < -45 && currentIndex < activeDuas.length - 1) {
        // Swipe left -> strictly next Dua (+1)
        lastSwipeTimeRef.current = now;
        setCurrentIndex(prev => Math.min(activeDuas.length - 1, prev + 1));
      } else if (diffX > 45 && currentIndex > 0) {
        // Swipe right -> strictly previous Dua (-1)
        lastSwipeTimeRef.current = now;
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleGestureCancel = () => {
    setDragOffset(0);
    cancelBoundaryHold();
  };

  const handleDirectRelease = () => {
    if (boundaryTransition.direction === 'next' && nextSection) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentIndex(0);
    } else if (boundaryTransition.direction === 'prev' && prevSection) {
      const prevIdx = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIdx);
      setCurrentIndex(FLATTENED_SECTIONS[prevIdx].duas.length - 1);
    }
    cancelBoundaryHold();
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
      if (e.key === 'ArrowRight') {
        changeDua('next');
      } else if (e.key === 'ArrowLeft') {
        changeDua('prev');
      } else if (e.key === 'Escape') {
        handleBackToHomeOrCategories();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, currentIndex, activeDuas.length, currentSectionIndex, nextSection, prevSection, handleBackToHomeOrCategories]);

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
                <h1 className="cdr-glass-nav-title" title={subcategoryTitle}>
                  <span className="cdr-glass-nav-marquee-track">
                    <span className="cdr-glass-nav-marquee-item">{subcategoryTitle}</span>
                    <span className="cdr-glass-nav-marquee-item" aria-hidden="true">{subcategoryTitle}</span>
                    <span className="cdr-glass-nav-marquee-item" aria-hidden="true">{subcategoryTitle}</span>
                    <span className="cdr-glass-nav-marquee-item" aria-hidden="true">{subcategoryTitle}</span>
                  </span>
                </h1>
                <p className="cdr-glass-nav-subtitle">{categoryTitle}</p>
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

          {/* Main Scrollable Content Container with Continuous Swipe & Pointer Support */}
          <main 
            className="cdr-reading-scroll-area cdr-no-scrollbar"
            style={{
              paddingBottom: isPlayerExpanded ? '300px' : '96px'
            }}
            onTouchStart={(e) => {
              const t = e.touches[0] || e.targetTouches[0];
              if (t) handleGestureStart(t.clientX, t.clientY, e.target);
            }}
            onTouchMove={(e) => {
              const t = e.touches[0] || e.targetTouches[0];
              if (t) handleGestureMove(t.clientX, t.clientY);
            }}
            onTouchEnd={handleGestureEnd}
            onTouchCancel={handleGestureCancel}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse' || e.button !== 0) return;
              handleGestureStart(e.clientX, e.clientY, e.target);
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse' || e.buttons !== 1) return;
              handleGestureMove(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              if (e.pointerType !== 'mouse') return;
              handleGestureEnd();
            }}
            onPointerCancel={(e) => {
              if (e.pointerType !== 'mouse') return;
              handleGestureCancel();
            }}
          >
            {activeDuas[currentIndex] && (
              <div 
                className="cdr-dua-slide-container"
                style={{
                  transform: dragOffset ? `translateX(${dragOffset}px)` : 'none',
                  transition: dragOffset ? 'none' : 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
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
              </div>
            )}
          </main>

          {/* Smart Glassmorphic Transition Indicator (1-Second Hold & Release Interaction) */}
          {boundaryTransition.active && (
            <div 
              className="cdr-swipe-indicator-backdrop"
              onClick={cancelBoundaryHold}
            >
              <div 
                className="cdr-swipe-indicator-card"
                onClick={e => e.stopPropagation()}
              >
                {/* Header Pill */}
                <div className="cdr-indicator-header-pill">
                  <Sparkles size={13} className="cdr-indicator-sparkle" />
                  <span>
                    {boundaryTransition.isEnd
                      ? "END OF COLLECTION"
                      : boundaryTransition.isBeginning
                      ? "FIRST DUA"
                      : boundaryTransition.isCategoryChange
                      ? (boundaryTransition.direction === 'next' ? "MOVING TO NEXT CATEGORY" : "MOVING TO PREVIOUS CATEGORY")
                      : (boundaryTransition.direction === 'next' ? "MOVING TO NEXT SUBCATEGORY" : "MOVING TO PREVIOUS SUBCATEGORY")}
                  </span>
                </div>

                {/* Content */}
                {boundaryTransition.isEnd ? (
                  <div className="cdr-indicator-end-box">
                    <CheckCircle2 size={36} style={{ color: '#0D9488', margin: '4px 0 8px' }} />
                    <p className="cdr-indicator-end-title">അവസാന ദുആയിൽ എത്തിച്ചേർന്നു</p>
                    <p className="cdr-indicator-end-desc">You've reached the end of all Duas & Adhkar in the app</p>
                    <button 
                      className="cdr-indicator-close-btn"
                      onClick={cancelBoundaryHold}
                    >
                      Close
                    </button>
                  </div>
                ) : boundaryTransition.isBeginning ? (
                  <div className="cdr-indicator-end-box">
                    <Sparkles size={36} style={{ color: '#0D9488', margin: '4px 0 8px' }} />
                    <p className="cdr-indicator-end-title">ആദ്യ ദുആയിലാണ് താങ്കൾ</p>
                    <p className="cdr-indicator-end-desc">You are at the beginning of the Dua collection</p>
                    <button 
                      className="cdr-indicator-close-btn"
                      onClick={cancelBoundaryHold}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="cdr-indicator-body">
                    {/* CURRENT: Section */}
                    <span className="cdr-indicator-section-label">CURRENT:</span>
                    <h3 className="cdr-indicator-current-title">
                      {boundaryTransition.currentSubcategoryName}
                    </h3>

                    {/* Middle Circular Arrow Badge */}
                    <div className="cdr-indicator-arrow-badge">
                      <ChevronsDown size={22} strokeWidth={2.8} />
                    </div>

                    {/* NEXT: Section */}
                    <span className="cdr-indicator-section-label">
                      {boundaryTransition.direction === 'next' ? 'NEXT:' : 'PREVIOUS:'}
                    </span>
                    <h3 className="cdr-indicator-next-title">
                      {boundaryTransition.targetSubcategoryName}
                    </h3>
                    {boundaryTransition.isCategoryChange && (
                      <div className="cdr-indicator-cat-badge">
                        <Folder size={12} />
                        <span>{boundaryTransition.targetCategoryName}</span>
                      </div>
                    )}

                    {/* 1-Second Animated Progress Bar */}
                    <div className="cdr-indicator-progress-wrap">
                      <div 
                        className="cdr-indicator-progress-fill"
                        style={{ width: `${boundaryTransition.progress}%` }}
                      />
                    </div>

                    {/* Bottom Action / Status Pill */}
                    <div 
                      className={`cdr-indicator-status-pill ${boundaryTransition.readyToRelease ? 'ready' : ''}`}
                      onClick={boundaryTransition.readyToRelease ? handleDirectRelease : undefined}
                      role={boundaryTransition.readyToRelease ? 'button' : undefined}
                      tabIndex={boundaryTransition.readyToRelease ? 0 : undefined}
                    >
                      <span className={`cdr-indicator-pill-dot ${boundaryTransition.readyToRelease ? 'ready' : ''}`} />
                      <span>
                        {boundaryTransition.readyToRelease 
                          ? (boundaryTransition.direction === 'next' ? "Release now" : "Release now")
                          : "Keep holding..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              AUDIO PLAYER COMPONENT (COLLAPSED & EXPANDED)
              Matches Reference Image: media_1794068274071_28e30207.jpg
              ======================================================== */}
          {!isPlayerExpanded ? (
            /* 1. COLLAPSED VIEW: Minimal centered circular emerald Play button */
            <div className="audio-player-collapsed-wrapper">
              <button 
                type="button"
                onClick={handleCollapsedButtonClick}
                className="audio-player-collapsed-btn"
                aria-label={isPlaying ? "Pause Audio" : "Play Audio & Expand Player"}
                title={isPlaying ? "Pause" : "Play Audio"}
              >
                {isPlaying ? (
                  <Pause size={24} fill="#FFFFFF" color="#FFFFFF" />
                ) : (
                  <Play size={24} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '3px' }} />
                )}
              </button>
            </div>
          ) : (
            /* 2. EXPANDED VIEW: Exact match to user reference screenshot */
            <div 
              className="audio-player-expanded-dock"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              role="region"
              aria-label="Audio Player"
            >
              {/* Top Row: Title on Left, Collapse Chevron on Right */}
              {/* Middle Row: Previous, Big Center Play/Pause, Next, Divider, Speed Selector */}
              <div className="audio-player-controls-row">
                {/* Previous Button */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeDua('prev');
                  }}
                  disabled={currentIndex === 0 && !prevSection}
                  className="audio-player-track-btn"
                  title="Previous Dua"
                  aria-label="Previous Dua"
                >
                  <SkipBack size={19} strokeWidth={2.4} />
                </button>

                {/* Large Center Play / Pause Button */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStickyPlay(e);
                  }}
                  className="audio-player-main-play-btn"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={24} fill="#FFFFFF" color="#FFFFFF" />
                  ) : (
                    <Play size={24} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '3px' }} />
                  )}
                </button>

                {/* Next Button */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeDua('next');
                  }}
                  disabled={currentIndex === activeDuas.length - 1 && !nextSection}
                  className="audio-player-track-btn"
                  title="Next Dua"
                  aria-label="Next Dua"
                >
                  <SkipForward size={19} strokeWidth={2.4} />
                </button>

                {/* Vertical Divider Line */}
                <div className="audio-player-divider" />

                {/* Repeat Button */}
                <button 
                  type="button"
                  onClick={toggleRepeat}
                  className={`audio-player-repeat-btn ${isRepeat ? 'active' : ''}`}
                  title={isRepeat ? "Repeat is ON" : "Repeat is OFF"}
                  aria-label={isRepeat ? "Turn Repeat Off" : "Turn Repeat On"}
                  aria-pressed={isRepeat}
                >
                  <Repeat size={16} strokeWidth={2.4} />
                </button>

                {/* Playback Speed Pill (1x, 1.25x, 1.5x, 2x) */}
                <button 
                  type="button"
                  onClick={toggleSpeed}
                  className="audio-player-speed-btn"
                  title="Playback Speed"
                  aria-label="Change Playback Speed"
                >
                  <span>{playbackSpeed}x</span>
                  <ChevronDown size={14} strokeWidth={2.4} />
                </button>
              </div>

              {/* Bottom Row: Current Time, Progress Slider with Knob, Total Duration */}
              <div className="audio-player-timeline-row">
                <span className="audio-player-time-text">
                  {formatTime(currentTimeSec)}
                </span>

                <div 
                  className="audio-player-slider-wrap"
                  onClick={handleSeek}
                  role="progressbar"
                  aria-valuenow={Math.round(audioProgress)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="audio-player-slider-track">
                    <div 
                      className="audio-player-slider-fill"
                      style={{ width: `${audioProgress}%` }}
                    >
                      <div className="audio-player-slider-thumb" />
                    </div>
                  </div>
                </div>

                <span className="audio-player-time-text" style={{ textAlign: 'right' }}>
                  {formatTime(durationSec || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
