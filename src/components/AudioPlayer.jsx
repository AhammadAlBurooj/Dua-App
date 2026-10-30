import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Repeat, 
  Wifi, 
  AlertCircle, 
  RefreshCw,
  Headphones
} from 'lucide-react';
import { audioService } from '../utils/audioService';

/**
 * Format seconds into mm:ss
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ dua, settings, onUpdateSettings }) {
  const [audioState, setAudioState] = useState(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsubscribe;
  }, []);

  if (!dua) return null;

  const isEnglish = settings?.language === 'en';
  const isThisDuaPlaying = audioState.isPlaying && audioState.currentDuaId === dua.id;
  const isThisDuaCurrent = audioState.currentDuaId === dua.id;
  const hasAudioUrl = Boolean(dua.audioUrl);

  const speedOptions = [0.75, 1.0, 1.25, 1.5];

  // If this specific Dua does not have a real verified audio file yet:
  // Strictly prevent fake play buttons as requested.
  if (!hasAudioUrl) {
    return (
      <div className="audio-player-card audio-unavailable-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="audio-unavailable-icon">
            <Headphones size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
              {isEnglish ? "Authentic Audio Coming Soon" : "യഥാർത്ഥ സ്റ്റുഡിയോ ഓഡിയോ ഉടൻ"}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '2px' }}>
              {isEnglish 
                ? "Studio recitation with authentic Tajweed will be added in upcoming updates." 
                : "അംഗീകൃത ഉസ്താദിന്റെ തെറ്റില്ലാത്ത തജ്‌വീദോടുകൂടിയ പാരായണം ഉടൻ ലഭ്യമാകും."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle Play / Pause / Resume
  const handleTogglePlay = () => {
    if (isThisDuaPlaying) {
      audioService.pause();
    } else if (isThisDuaCurrent && audioState.currentTime > 0) {
      audioService.resume();
    } else {
      audioService.playDua(dua, audioState.speed, audioState.isLoop);
    }
  };

  // Replay from beginning (0:00)
  const handleReplay = (e) => {
    e.stopPropagation();
    if (isThisDuaCurrent) {
      audioService.replay();
    } else {
      audioService.playDua(dua, audioState.speed, audioState.isLoop);
    }
  };

  // Handle Scrubber Progress Seek
  const handleScrubberClick = (e) => {
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

  // Speed selection
  const handleSpeedSelect = (spd) => {
    audioService.setSpeed(spd);
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, audioSpeed: spd });
    }
  };

  const reciterName = dua.reciter || (isEnglish ? "Sheikh Mishary Rashid Alafasy" : "ശൈഖ് മിശാരി റാശിദ് അൽ-അഫാസി");
  const progressPercent = isThisDuaCurrent ? audioState.progress : 0;
  const currentTimeSec = isThisDuaCurrent ? audioState.currentTime : 0;
  const durationSec = isThisDuaCurrent ? audioState.duration : 0;

  return (
    <div className={`audio-player-card ${isThisDuaPlaying ? 'is-active-player' : ''}`}>
      {/* Network / Error Notice */}
      {audioState.error && isThisDuaCurrent && (
        <div className="audio-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} color="#DC2626" />
            <span>{audioState.error}</span>
          </div>
          <button 
            className="chip-btn audio-retry-btn"
            onClick={() => audioService.retry()}
            title={isEnglish ? "Retry" : "വീണ്ടും ശ്രമിക്കുക"}
          >
            <RefreshCw size={12} />
            <span>{isEnglish ? "Retry" : "വീണ്ടും ശ്രമിക്കുക"}</span>
          </button>
        </div>
      )}

      {/* Reciter and Internet status top header */}
      <div className="audio-player-top">
        <div className="audio-reciter-tag">
          <Headphones size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span className="reciter-title">
            {isEnglish ? "Reciter:" : "ഖാരിഅ്:"} <strong>{reciterName}</strong>
          </span>
          <span className="audio-studio-pill">
            {isEnglish ? "Studio Quality" : "സ്റ്റുഡിയോ ക്വാളിറ്റി"}
          </span>
        </div>

        <div className="audio-internet-badge" title={isEnglish ? "Requires Internet" : "ഓഡിയോ കേൾക്കാൻ ഇന്റർനെറ്റ് ആവശ്യമാണ്"}>
          <Wifi size={11} />
          <span>{isEnglish ? "Online" : "ഓൺലൈൻ"}</span>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="audio-controls-row">
        <div className="audio-left-controls">
          {/* Main Play / Pause Button */}
          <button 
            className={`audio-play-large-btn ${audioState.isLoading && isThisDuaCurrent ? 'is-loading' : ''}`}
            onClick={handleTogglePlay}
            disabled={audioState.isLoading && isThisDuaCurrent}
            aria-label={isThisDuaPlaying ? "Pause Audio" : "Play Audio"}
            title={isThisDuaPlaying ? (isEnglish ? "Pause" : "നിർത്തുക") : (isEnglish ? "Play" : "ഓഡിയോ കേൾക്കുക")}
          >
            {audioState.isLoading && isThisDuaCurrent ? (
              <RefreshCw size={19} className="spin-animation" />
            ) : isThisDuaPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Replay Button (തുടക്കം മുതൽ വീണ്ടും കേൾക്കുക) */}
          <button
            className="icon-btn audio-action-btn"
            onClick={handleReplay}
            title={isEnglish ? "Replay from start" : "തുടക്കം മുതൽ വീണ്ടും കേൾക്കുക (Replay)"}
            aria-label="Replay Audio"
          >
            <RotateCcw size={16} />
          </button>

          {/* Loop / Repeat Button */}
          <button
            className={`icon-btn audio-action-btn ${audioState.isLoop ? 'active' : ''}`}
            onClick={() => audioService.toggleLoop()}
            title={audioState.isLoop 
              ? (isEnglish ? "Repeat is ON" : "റിപ്പീറ്റ് ഓണാണ് (Loop ON)") 
              : (isEnglish ? "Repeat audio" : "ആവർത്തിച്ചു കേൾക്കുക (Repeat)")}
            aria-label="Repeat Audio"
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Live Audio Status Text */}
        <div className="audio-status-indicator">
          {isThisDuaPlaying ? (
            <span className="audio-pulse-indicator">
              <span className="pulse-dot"></span>
              {isEnglish ? "Playing Recitation..." : "പാരായണം കേൾക്കുന്നു..."}
            </span>
          ) : isThisDuaCurrent && currentTimeSec > 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>
              {isEnglish ? "Paused" : "നിർത്തിവെച്ചു"}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              {isEnglish ? "Ready to play" : "കേൾക്കാൻ തയ്യാർ"}
            </span>
          )}
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="audio-progress-wrap">
        <div 
          className="audio-scrubber" 
          onClick={handleScrubberClick}
          role="slider"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin="0"
          aria-valuemax="100"
          tabIndex={0}
        >
          <div 
            className="audio-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="audio-scrubber-handle"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Current Time and Total Duration */}
        <div className="audio-time-row">
          <span>{formatTime(currentTimeSec)}</span>
          <span style={{ opacity: 0.7 }}>
            {durationSec > 0 ? formatTime(durationSec) : '--:--'}
          </span>
        </div>
      </div>

      {/* Audio Speed Control Row (0.75x, 1x, 1.25x, 1.5x) */}
      <div className="audio-speed-section">
        <span className="speed-section-label">
          {isEnglish ? "Playback Speed:" : "ഓഡിയോ വേഗത:"}
        </span>
        <div className="speed-chips-row">
          {speedOptions.map((spd) => {
            const isSelected = audioState.speed === spd;
            return (
              <button
                key={spd}
                className={`speed-chip ${isSelected ? 'speed-chip-active' : ''}`}
                onClick={() => handleSpeedSelect(spd)}
                type="button"
              >
                {spd}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
