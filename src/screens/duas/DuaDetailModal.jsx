import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  BookOpen, 
  Play, 
  Pause, 
  ChevronDown,
  Volume2
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { audioService } from '../../utils/audioService';
import { registerBackButtonHandler } from '../../utils/backButtonManager';

/**
 * Format seconds into mm:ss
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function DuaDetailModal({ 
  dua, 
  categoryDuas = [],
  isFavorite, 
  onToggleFavorite, 
  onClose,
  onSelectDua,
  settings,
  onUpdateSettings
}) {
  const [audioState, setAudioState] = useState(audioService.getState());
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);
  const isTouchIgnored = useRef(false);
  const touchStartTime = useRef(0);
  const mouseStartX = useRef(0);
  const isMouseDown = useRef(false);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  // Listen to audio service updates
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsubscribe;
  }, []);

  // Handle mobile hardware back button
  useEffect(() => {
    const unregister = registerBackButtonHandler(() => {
      onClose();
      return true;
    }, 90);
    return unregister;
  }, [onClose]);

  // Find index in category list for swiping
  const currentList = categoryDuas.length > 0 ? categoryDuas : (dua ? [dua] : []);
  const currentIndex = dua ? currentList.findIndex(d => d.id === dua.id) : -1;
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  const totalCount = currentList.length;

  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < totalCount - 1;

  const handlePrev = () => {
    if (hasPrev) {
      audioService.stop();
      onSelectDua(currentList[safeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      audioService.stop();
      onSelectDua(currentList[safeIndex + 1]);
    }
  };

  // Screen swiping keyboard navigation for desktop
  useEffect(() => {
    if (!dua) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dua, safeIndex, hasPrev, hasNext]);

  // Touch Swipe Handlers for mobile screen swiping
  const handleTouchStart = (e) => {
    if (e.target.closest('button, [role="button"], input, [role="progressbar"], .ref-scrubber-track, .ref-inline-audio-bar, audio, a')) {
      isTouchIgnored.current = true;
      return;
    }
    isTouchIgnored.current = false;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    touchMoved.current = false;
  };

  const handleTouchMove = () => {
    if (isTouchIgnored.current) return;
    touchMoved.current = true;
  };

  const handleTouchEnd = (e) => {
    if (isTouchIgnored.current) {
      isTouchIgnored.current = false;
      return;
    }

    if (!touchMoved.current) return;
    touchMoved.current = false;

    const touch = e.changedTouches[0];
    if (!touch) return;
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    const duration = Date.now() - touchStartTime.current;

    // Detect horizontal swipe across screen
    if (Math.abs(diffX) >= 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5 && duration < 800) {
      if (diffX > 0 && hasNext) {
        handleNext();
      } else if (diffX < 0 && hasPrev) {
        handlePrev();
      }
    }
  };

  // Mouse Drag Handlers for desktop screen swiping
  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, .ref-scrubber-track, .ref-inline-audio-bar')) return;
    mouseStartX.current = e.clientX;
    isMouseDown.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const diffX = mouseStartX.current - e.clientX;
    if (Math.abs(diffX) > 45) {
      if (diffX > 0 && hasNext) {
        handleNext();
      } else if (diffX < 0 && hasPrev) {
        handlePrev();
      }
    }
  };

  // Audio Playback
  const isThisDuaPlaying = audioState.isPlaying && audioState.currentDuaId === dua.id;
  const isThisDuaCurrent = audioState.currentDuaId === dua.id;
  const hasAudioUrl = Boolean(dua.audioUrl);

  const handleTogglePlay = () => {
    if (!hasAudioUrl) return;
    if (isThisDuaPlaying) {
      audioService.pause();
    } else if (isThisDuaCurrent && audioState.currentTime > 0) {
      audioService.resume();
    } else {
      audioService.playDua(dua, audioState.speed, audioState.isLoop);
    }
  };

  const handleScrubberClick = (e) => {
    if (!hasAudioUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    if (!isThisDuaCurrent) {
      audioService.playDua(dua, audioState.speed, audioState.isLoop);
      setTimeout(() => audioService.seek(percent), 150);
    } else {
      audioService.seek(percent);
    }
  };

  const handleSpeedSelect = (spd) => {
    audioService.setSpeed(spd);
    setShowSpeedMenu(false);
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, audioSpeed: spd });
    }
  };

  const progressPercent = isThisDuaCurrent ? audioState.progress : 0;
  const currentTimeSec = isThisDuaCurrent ? audioState.currentTime : 0;
  const durationSec = isThisDuaCurrent ? audioState.duration : 0;

  if (!dua) return null;

  const category = CATEGORIES.find(c => c.id === dua.categoryId);
  const categoryTitle = category 
    ? (isEnglish ? category.titleEn : category.titleMl) 
    : (isEnglish ? 'Dua' : 'ദുആ');

  const isQuranic = dua.sourceType === 'quran';
  const refLabel = isQuranic 
    ? (isEnglish ? "Quran Reference" : "ഖുർആൻ റഫറൻസ്")
    : (isEnglish ? "Hadith Reference" : "ഹദീസ് റഫറൻസ്");

  return (
    <div 
      className="reference-dua-detail-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* ========================================================
          1. TOP APP BAR (Back, Title, Category Pill, Favorite)
          ======================================================== */}
      <div className="ref-detail-header-bar">
        <button 
          className="icon-btn ref-back-btn" 
          onClick={() => {
            audioService.stop();
            onClose();
          }} 
          title={isEnglish ? "Back" : "തിരികെ പോവുക"}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="ref-header-title-col">
          <h1 className="ref-dua-title-heading">
            {isEnglish ? dua.titleEn : dua.titleMl}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span className="ref-category-badge-pill">
              {categoryTitle}
            </span>
            {totalCount > 1 && (
              <span className="ref-category-badge-pill" style={{ background: '#E2ECE6', color: '#0E5C43', fontWeight: 700 }}>
                {safeIndex + 1} / {totalCount}
              </span>
            )}
          </div>
        </div>

        <button 
          className="icon-btn ref-heart-btn"
          onClick={() => onToggleFavorite(dua.id)}
          title={isFavorite ? (isEnglish ? "Remove favorite" : "ഫേവറിറ്റ്സിൽ നിന്ന് നീക്കുക") : (isEnglish ? "Add favorite" : "ഫേവറിറ്റ്സിൽ ചേർക്കുക")}
          aria-label="Toggle Favorite"
        >
          <Heart 
            size={20} 
            fill={isFavorite ? '#C0392B' : 'none'} 
            color={isFavorite ? '#C0392B' : 'var(--text-tertiary)'} 
          />
        </button>
      </div>

      {/* ========================================================
          2. BODY CONTENT (Scrollable screen)
          ======================================================== */}
      <div className="ref-detail-scroll-body">
        {/* Arabic Card (Centered large font in soft light green card) */}
        <div className={`ref-arabic-card ${isThisDuaPlaying ? 'playing-glow' : ''}`}>
          <p className="ref-arabic-text">
            {dua.arabic}
          </p>
        </div>

        {/* Pronunciation Section: ഉച്ചാരണം (മലയാളത്തിൽ) */}
        {(dua.transliteration || dua.transli_en) && (
          <div className="ref-section-block">
            <h3 className="ref-section-title">
              {isEnglish ? "Pronunciation (Transliteration)" : "ഉച്ചാരണം (മലയാളത്തിൽ)"}
            </h3>
            <p className="ref-section-text ref-transliteration-text">
              {isEnglish ? (dua.transli_en || dua.transliteration) : dua.transliteration}
            </p>
          </div>
        )}

        {/* Meaning / Translation Section */}
        <div className="ref-section-block">
          <h3 className="ref-section-title">
            {isEnglish ? "Translation" : "മലയാളം അർത്ഥം"}
          </h3>
          <p className="ref-section-text ref-meaning-ml-text">
            {isEnglish ? (dua.meaningEn || dua.trans_en || dua.meaningMl) : dua.meaningMl}
          </p>
        </div>

        {/* Hadith / Quran Reference Section: ഹദീസ് റഫറൻസ് */}
        <div className="ref-reference-card">
          <div className="ref-book-icon-bubble">
            <BookOpen size={17} />
          </div>
          <div className="ref-reference-col">
            <span className="ref-label-sub">
              {refLabel}
            </span>
            <span className="ref-text-val">
              {dua.reference}
            </span>
          </div>
        </div>

        {/* Audio Player Bar (Screen 3-6 audio bar) */}
        <div className="ref-inline-audio-bar">
          {hasAudioUrl ? (
            <>
              {/* Play / Pause Circular Green Button */}
              <button 
                className="ref-audio-play-circle"
                onClick={handleTogglePlay}
                aria-label={isThisDuaPlaying ? "Pause Audio" : "Play Audio"}
                title={isThisDuaPlaying ? (isEnglish ? "Pause" : "നിർത്തുക") : (isEnglish ? "Play" : "ഓഡിയോ കേൾക്കുക")}
              >
                {isThisDuaPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '1.5px' }} />}
              </button>

              {/* Scrubber Progress Bar & Timers */}
              <div className="ref-scrubber-col">
                <div 
                  className="ref-scrubber-track"
                  onClick={handleScrubberClick}
                  role="slider"
                  aria-valuenow={Math.round(progressPercent)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div 
                    className="ref-scrubber-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="ref-timers-row">
                  <span>{formatTime(currentTimeSec)}</span>
                  <span>{durationSec > 0 ? formatTime(durationSec) : '--:--'}</span>
                </div>
              </div>

              {/* Speed dropdown pill (0.75x, 1x, 1.25x, 1.5x) */}
              <div className="ref-speed-dropdown-wrap">
                <button 
                  className="ref-speed-pill-btn"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  title="Playback Speed"
                >
                  <span>{audioState.speed}x</span>
                  <ChevronDown size={12} />
                </button>

                {showSpeedMenu && (
                  <div className="ref-speed-popover">
                    {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        className={`ref-speed-opt ${audioState.speed === spd ? 'active' : ''}`}
                        onClick={() => handleSpeedSelect(spd)}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Speaker / Volume button matching reference mockup */}
              <button 
                className={`icon-btn ref-audio-opt-btn ${audioState.isLoop ? 'active' : ''}`}
                onClick={() => audioService.toggleLoop()}
                title={audioState.isLoop ? "Repeat: Active" : "Repeat / Audio"}
                aria-label="Audio Option"
              >
                <Volume2 size={16} />
              </button>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-malayalam)' }}>
              <Volume2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>{isEnglish ? "Authentic audio coming soon in update" : "യഥാർത്ഥ സ്റ്റുഡിയോ ഓഡിയോ ഉടൻ ലഭ്യമാകും"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
