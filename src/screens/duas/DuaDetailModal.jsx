import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  RotateCcw, 
  Repeat, 
  BookOpen, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  Check,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../../data/categories';
import { audioService } from '../../utils/audioService';
import { UI_TEXT } from '../../utils/translations';

export default function DuaDetailModal({ 
  dua, 
  allDuas = [],
  isFavorite, 
  onToggleFavorite, 
  onClose,
  onSelectDua,
  onShowToast,
  settings,
  onUpdateSettings
}) {
  const [audioState, setAudioState] = useState(audioService.getState());
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [copied, setCopied] = useState(false);

  const lang = settings?.language || 'ml';
  const t = UI_TEXT[lang] || UI_TEXT.ml;
  const isEnglish = lang === 'en';

  // Sync audio service
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsubscribe;
  }, []);

  // Reset tasbeeh count when dua changes
  useEffect(() => {
    setTasbeehCount(0);
  }, [dua?.id]);

  if (!dua) return null;

  const category = CATEGORIES.find(c => c.id === dua.categoryId);
  const targetCount = dua.recommendedCount || 1;
  const isThisDuaPlaying = audioState.isPlaying && audioState.currentDuaId === dua.id;

  // Find index for next/prev
  const currentIndex = allDuas.findIndex(d => d.id === dua.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allDuas.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      audioService.stop();
      onSelectDua(allDuas[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      audioService.stop();
      onSelectDua(allDuas[currentIndex + 1]);
    }
  };

  const handleTogglePlay = () => {
    if (isThisDuaPlaying) {
      audioService.pause();
    } else {
      audioService.playDua(dua, settings?.audioSpeed || 1.0, audioState.isLoop);
    }
  };

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = (clickX / rect.width) * 100;
    audioService.seek(percent);
  };

  const handleSpeedChange = (speed) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, audioSpeed: speed });
    }
    audioService.setSpeed(speed);
  };

  const handleTasbeehTap = () => {
    const nextCount = tasbeehCount + 1;
    setTasbeehCount(nextCount);

    // Audio chime & haptic feedback
    audioService.playChime(580 + (nextCount % 5) * 40, 0.04);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (nextCount === targetCount) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
      onShowToast(isEnglish ? `Alhamdulillah! ${targetCount} times completed` : `അൽഹംദുലില്ലാഹ്! ${targetCount} തവണ പൂർത്തിയായി`);
    }
  };

  const handleResetTasbeeh = () => {
    setTasbeehCount(0);
    audioService.playChime(350, 0.03);
  };

  const handleShare = async () => {
    const shareText = `✨ ${dua.titleMl} (${dua.titleEn})\n\n${dua.arabic}\n\n📖 ${isEnglish ? 'Transliteration' : 'ഉച്ചാരണം'}: ${dua.transliteration}\n\n🌿 ${isEnglish ? 'Malayalam Meaning' : 'മലയാള അർത്ഥം'}: ${dua.meaningMl}\n\n🌟 English: ${dua.meaningEn}\n\n📌 ${isEnglish ? 'Reference' : 'റഫറൻസ്'}: ${dua.reference}\n\n— Dua App`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isEnglish ? dua.titleEn : dua.titleMl,
          text: shareText
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast(t.copiedToast);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const arabicFontSize = settings?.arabicFontSize || 28;
  const primaryTitle = isEnglish ? dua.titleEn : dua.titleMl;
  const secondaryTitle = isEnglish ? dua.titleMl : dua.titleEn;
  const categoryTitle = category ? (isEnglish ? category.titleEn : category.titleMl) : (isEnglish ? 'Dua' : 'ദുആ');

  return (
    <div className="dua-detail-overlay" id="dua-detail-view" role="dialog" aria-modal="true">
      {/* Top Navigation */}
      <nav className="detail-nav-bar">
        <button 
          className="icon-btn" 
          onClick={onClose} 
          title={isEnglish ? "Back" : "തിരികെ പോവുക"}
          aria-label="Back to previous screen"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="detail-nav-title">
          {primaryTitle}
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className={`icon-btn ${showFontSlider ? 'active' : ''}`}
            onClick={() => setShowFontSlider(!showFontSlider)}
            title={isEnglish ? "Adjust font size" : "അറബിക് ഫോണ്ട് സൈസ് മാറ്റുക"}
            aria-label="Adjust font size"
          >
            <Sliders size={17} />
          </button>

          <button 
            className="icon-btn" 
            onClick={handleShare}
            title={t.shareDua}
            aria-label="Share Dua"
          >
            {copied ? <Check size={17} color="var(--primary)" /> : <Share2 size={17} />}
          </button>

          <button 
            className="icon-btn" 
            onClick={() => onToggleFavorite(dua.id)}
            title={isFavorite ? (isEnglish ? "Remove from favorites" : "ഫേവറിറ്റ്സിൽ നിന്ന് നീക്കുക") : (isEnglish ? "Add to favorites" : "ഫേവറിറ്റ്സിൽ ചേർക്കുക")}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            style={{
              color: isFavorite ? '#C0392B' : 'var(--text-tertiary)',
              backgroundColor: isFavorite ? 'rgba(192, 57, 43, 0.08)' : undefined
            }}
          >
            <Heart size={18} fill={isFavorite ? '#C0392B' : 'none'} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* Font Size Quick Slider Drawer */}
      {showFontSlider && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>{isEnglish ? "Arabic Font Size" : "അറബി എഴുത്തിന്റെ വലിപ്പം"}</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{arabicFontSize}px</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="42" 
            value={arabicFontSize}
            onChange={(e) => onUpdateSettings({ ...settings, arabicFontSize: Number(e.target.value) })}
            className="font-slider"
          />
        </div>
      )}

      {/* Detail Content */}
      <div className="detail-body">
        {/* Header Title & Category */}
        <div className="detail-header-card">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="dua-badge">
              {categoryTitle}
            </span>
            {dua.authenticity && (
              <span 
                className="dua-badge authenticity-badge"
                style={{ 
                  backgroundColor: dua.sourceType === 'bukhari' || dua.sourceType === 'muslim' 
                    ? 'rgba(23, 107, 80, 0.15)' 
                    : (dua.sourceType === 'quran' ? 'rgba(8, 131, 149, 0.15)' : 'rgba(180, 83, 9, 0.15)'),
                  color: dua.sourceType === 'bukhari' || dua.sourceType === 'muslim' 
                    ? '#176B50' 
                    : (dua.sourceType === 'quran' ? '#088395' : '#B45309'),
                  fontWeight: 700
                }}
              >
                {dua.authenticity}
              </span>
            )}
            {targetCount > 1 && (
              <span className="dua-badge" style={{ backgroundColor: 'var(--accent-gold-soft)', color: 'var(--accent-gold)' }}>
                {targetCount} {isEnglish ? 'times' : 'തവണ ചൊല്ലുക'}
              </span>
            )}
          </div>
          <h1 className="detail-main-title">{primaryTitle}</h1>
          <p className="detail-english-title">{secondaryTitle}</p>
        </div>

        {/* Large Crystal-Clear Arabic Card (Noto Naskh Arabic) */}
        {settings?.showArabic !== false && (
          <div className="detail-arabic-card">
            <p 
              className="detail-arabic-text"
              style={{ fontSize: `${arabicFontSize}px` }}
            >
              {dua.arabic}
            </p>
          </div>
        )}

        {/* Audio Player Card */}
        <div className="audio-player-card">
          <div className="audio-controls-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="audio-play-large-btn"
                onClick={handleTogglePlay}
                aria-label={isThisDuaPlaying ? "Pause Audio" : "Play Audio"}
              >
                {isThisDuaPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
              </button>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
                  {isThisDuaPlaying ? (isEnglish ? "Playing Recitation..." : "ഓഡിയോ പ്ലേ ചെയ്യുന്നു...") : (isEnglish ? "Play Recitation" : "ഓഡിയോ കേൾക്കുക")}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{dua.reciter ? (isEnglish ? `Reciter: ${dua.reciter}` : `ഖാരിഅ്: ${dua.reciter}`) : (isEnglish ? "Clear Arabic recitation" : "ശുദ്ധമായ അറബിക് ഉച്ചാരണം")}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Speed Toggle */}
              <button
                className="icon-btn"
                style={{ width: '34px', height: '34px', fontSize: '11px', fontWeight: 700 }}
                onClick={() => {
                  const speeds = [0.8, 1.0, 1.25];
                  const currentIdx = speeds.indexOf(audioState.speed);
                  const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
                  handleSpeedChange(nextSpeed);
                }}
                title={isEnglish ? "Change speed" : "ഓഡിയോ വേഗത മാറ്റുക"}
              >
                {audioState.speed}x
              </button>

              {/* Loop Toggle */}
              <button
                className={`icon-btn ${audioState.isLoop ? 'active' : ''}`}
                style={{ width: '34px', height: '34px' }}
                onClick={() => audioService.toggleLoop()}
                title={isEnglish ? "Loop audio" : "വീണ്ടും പ്ലേ ചെയ്യുക (Loop)"}
              >
                <Repeat size={14} />
              </button>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="audio-progress-wrap">
            <div 
              className="audio-scrubber" 
              onClick={handleScrubberClick}
              role="slider"
              aria-valuenow={Math.round(isThisDuaPlaying ? audioState.progress : 0)}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div 
                className="audio-progress-bar"
                style={{ width: `${isThisDuaPlaying ? audioState.progress : 0}%` }}
              />
            </div>
            <div className="audio-time-row">
              <span>{formatTime(isThisDuaPlaying ? audioState.currentTime : 0)}</span>
              <span>{formatTime(isThisDuaPlaying ? audioState.duration : 10)}</span>
            </div>
          </div>
        </div>

        {/* Digital Tasbeeh / Count Tracker */}
        <div className="tasbeeh-counter-card">
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
              {isEnglish ? "Tasbeeh Counter" : "തസ്ബീഹ് കൗണ്ടർ (Tasbeeh)"}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '2px' }}>
              {isEnglish ? "Target:" : "ലക്ഷ്യം:"} <strong>{targetCount} {isEnglish ? "times" : "തവണ"}</strong>
            </div>
            {tasbeehCount >= targetCount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '11.5px', fontWeight: 700, marginTop: '4px' }}>
                <CheckCircle2 size={13} />
                <span>{isEnglish ? "Target Completed!" : "പൂർത്തിയായി!"}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {tasbeehCount > 0 && (
              <button 
                className="icon-btn"
                style={{ width: '34px', height: '34px' }}
                onClick={handleResetTasbeeh}
                title={isEnglish ? "Reset count" : "കൗണ്ട് റീസെറ്റ് ചെയ്യുക"}
              >
                <RotateCcw size={15} />
              </button>
            )}

            <button 
              className="tasbeeh-counter-btn"
              onClick={handleTasbeehTap}
              aria-label={`Count: ${tasbeehCount} of ${targetCount}`}
            >
              <span>{tasbeehCount}</span>
              <span className="tasbeeh-counter-label">{isEnglish ? "Tap" : "ടാപ്പ് ചെയ്യുക"}</span>
            </button>
          </div>
        </div>

        {/* Transliteration (ഉച്ചാരണം) */}
        {settings?.showTransliteration !== false && dua.transliteration && (
          <div className="detail-text-card">
            <div className="detail-section-label">
              <span>{isEnglish ? "Malayalam Transliteration" : "മലയാളത്തിലുള്ള ഉച്ചാരണം"}</span>
            </div>
            <p className="transliteration-text">
              {dua.transliteration}
            </p>
          </div>
        )}

        {/* English Translation */}
        {settings?.showMeaningEn !== false && dua.meaningEn && (
          <div className="detail-text-card">
            <div className="detail-section-label" style={{ color: 'var(--primary)' }}>
              <span>English Translation</span>
            </div>
            <p className="meaning-en-text" style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {dua.meaningEn}
            </p>
          </div>
        )}

        {/* Malayalam Translation */}
        {settings?.showMeaningMl !== false && (
          <div className="detail-text-card">
            <div className="detail-section-label">
              <span>{isEnglish ? "Malayalam Translation" : "മലയാള അർത്ഥം • Meaning"}</span>
            </div>
            <p className="meaning-ml-text">
              {dua.meaningMl}
            </p>
          </div>
        )}

        {/* Benefit & Context (ഫദ്ൽ / ഗുണം) */}
        {dua.benefitMl && (
          <div className="detail-text-card" style={{ backgroundColor: 'var(--bg-sage-light)', borderColor: 'var(--border-soft)' }}>
            <div className="detail-section-label" style={{ color: 'var(--primary)' }}>
              <span>{isEnglish ? "Virtue & Context" : "ശ്രേഷ്ഠത & മഹത്വം"}</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)', lineHeight: 1.55 }}>
              {dua.benefitMl}
            </p>
          </div>
        )}

        {/* Verified Quran / Hadith Reference */}
        <div className="reference-card">
          <BookOpen size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.85 }}>
              {isEnglish ? "Authentic Reference" : (dua.authenticity ? dua.authenticity + " • റഫറൻസ്" : "വിശ്വാസ്യതയുള്ള റഫറൻസ്")}
            </div>
            <div style={{ marginTop: '2px' }}>
              {dua.reference}
            </div>
          </div>
        </div>

        {/* Next / Prev Navigation Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)'
        }}>
          <button 
            className="chip-btn"
            disabled={!hasPrev}
            onClick={handlePrev}
            style={{ opacity: hasPrev ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={16} />
            <span>{isEnglish ? "Previous Dua" : "മുമ്പത്തെ ദുആ"}</span>
          </button>

          <button 
            className="chip-btn"
            disabled={!hasNext}
            onClick={handleNext}
            style={{ opacity: hasNext ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{isEnglish ? "Next Dua" : "അടുത്ത ദുആ"}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
