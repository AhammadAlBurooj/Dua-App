import React from 'react';
import { Sparkles, Play, Pause, Heart, ArrowRight } from 'lucide-react';

export default function HeroDua({ 
  dua, 
  isFavorite, 
  isPlaying, 
  onTogglePlay, 
  onToggleFavorite, 
  onSelectDua,
  settings 
}) {
  if (!dua) return null;

  const isEnglish = settings?.language === 'en';
  const title = isEnglish ? dua.titleEn : dua.titleMl;
  const meaning = isEnglish && dua.meaningEn ? dua.meaningEn : dua.meaningMl;
  const hasAudio = Boolean(dua.audioUrl);

  return (
    <div 
      className={`hero-card ${isPlaying ? 'hero-playing-highlight' : ''}`}
      onClick={() => onSelectDua(dua)}
      role="button"
      tabIndex={0}
      aria-label={`Dua of the day: ${title}`}
    >
      <div className="hero-pill">
        <Sparkles size={13} />
        <span>{isEnglish ? "Dua of the Day" : "ഇന്നത്തെ ദുആ • Dua of the Day"}</span>
      </div>

      <h2 className="hero-title">{title}</h2>

      <div className={`arabic-text hero-arabic ${isPlaying ? 'arabic-playing-highlight' : ''}`}>
        {dua.arabic}
      </div>

      <p className="hero-meaning">
        {meaning}
      </p>

      <div className="hero-footer">
        {hasAudio ? (
          <button 
            className="hero-play-btn"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay(dua);
            }}
            aria-label={isPlaying ? (isEnglish ? "Pause Audio" : "നിർത്തുക") : (isEnglish ? "Listen Audio" : "ഓഡിയോ കേൾക്കുക")}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '1px' }} />}
            <span>{isPlaying ? (isEnglish ? "Stop" : "നിർത്തുക") : (isEnglish ? "Listen Audio" : "ഓഡിയോ കേൾക്കുക")}</span>
          </button>
        ) : (
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontFamily: 'var(--font-malayalam)', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 10px', borderRadius: '8px' }}>
            {isEnglish ? "Audio coming soon" : "യഥാർത്ഥ ഓഡിയോ ഉടൻ"}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="hero-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dua.id);
            }}
            title={isFavorite ? (isEnglish ? "Remove from favorites" : "ഫേവറിറ്റ്സിൽ നിന്ന് നീക്കുക") : (isEnglish ? "Add to favorites" : "ഫേവറിറ്റ്സിൽ ചേർക്കുക")}
            aria-label="Toggle favorite"
          >
            <Heart size={17} fill={isFavorite ? '#FAF9F4' : 'none'} color="#FAF9F4" />
          </button>

          <div className="hero-icon-btn" title={isEnglish ? "View details" : "വിശദമായി കാണുക"}>
            <ArrowRight size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}
