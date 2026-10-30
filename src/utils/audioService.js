/**
 * Authentic Islamic Audio Recitation Service
 * 
 * Exclusively plays authentic, studio-recorded Arabic recitations 
 * by renowned Islamic scholars & Qaris (e.g. Sheikh Mishary Rashid Alafasy).
 * 
 * Strict Quality Guidelines:
 * - NO AI-generated voices / NO TTS / NO SpeechSynthesis
 * - Studio-recorded, crystal-clear Arabic recitations with zero background noise
 * - Real Tajweed and authentic human pronunciation
 * - Full audio playback control: Play, Pause, Resume, Replay, Seeking, Speeds (0.75x, 1x, 1.25x, 1.5x)
 * - Transparent offline / network error handling without fake playback
 */

class AudioService {
  constructor() {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : null;
    this.currentDua = null;
    this.isPlaying = false;
    this.isLoading = false;
    this.progress = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.speed = 1.0;
    this.isLoop = false;
    this.reciter = '';
    this.error = null;
    this.onStateChangeCallbacks = new Set();

    this.setupAudioListeners();
  }

  setupAudioListeners() {
    if (!this.audio) return;

    this.audio.preload = 'auto';

    // Time & Progress Updates
    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      this.currentTime = this.audio.currentTime || 0;
      if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.duration = this.audio.duration;
        this.progress = (this.currentTime / this.duration) * 100;
      }
      this.notify();
    });

    // Duration Metadata Loaded
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
        this.isLoading = false;
        this.notify();
      }
    });

    // Loading / Buffering States
    this.audio.addEventListener('waiting', () => {
      this.isLoading = true;
      this.notify();
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading = false;
      this.notify();
    });

    // Playback Ended
    this.audio.addEventListener('ended', () => {
      if (this.isLoop && this.currentDua) {
        this.replay();
      } else {
        this.isPlaying = false;
        this.currentTime = 0;
        this.progress = 0;
        this.notify();
      }
    });

    // Audio Playback Error Handling
    this.audio.addEventListener('error', (e) => {
      console.warn('Real Audio recitation failed to load or network error:', e);
      this.isPlaying = false;
      this.isLoading = false;
      this.error = 'ഓഡിയോ ഫയൽ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക.';
      this.notify();
    });
  }

  subscribe(callback) {
    this.onStateChangeCallbacks.add(callback);
    callback(this.getState());
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.onStateChangeCallbacks.forEach(cb => {
      try {
        cb(state);
      } catch (e) {
        console.error('Error in audio subscriber:', e);
      }
    });
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      currentDuaId: this.currentDua ? this.currentDua.id : null,
      currentDua: this.currentDua,
      progress: this.progress,
      currentTime: this.currentTime,
      duration: this.duration,
      speed: this.speed,
      isLoop: this.isLoop,
      reciter: this.reciter || this.currentDua?.reciter || 'ശൈഖ് മിശാരി അൽ-അഫാസി',
      error: this.error
    };
  }

  /**
   * Play an authentic Dua recitation.
   */
  async playDua(dua, speed = this.speed, loop = this.isLoop) {
    if (!dua) return;

    // Reject fake audio if no verified audio file is linked
    if (!dua.audioUrl) {
      this.error = 'ഈ ദുആയ്ക്കുള്ള യഥാർത്ഥ സ്റ്റുഡിയോ ഓഡിയോ ഉടൻ ലഭ്യമാകും.';
      this.notify();
      return;
    }

    this.stop();
    this.currentDua = dua;
    this.speed = speed;
    this.isLoop = loop;
    this.currentTime = 0;
    this.progress = 0;
    this.duration = 0;
    this.error = null;
    this.isLoading = true;
    this.reciter = dua.reciter || 'ശൈഖ് മിശാരി അൽ-അഫാസി';

    if (!this.audio) return;

    this.audio.src = dua.audioUrl;
    this.audio.playbackRate = this.speed;
    this.audio.loop = this.isLoop;

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.isLoading = false;
      this.notify();
    } catch (err) {
      console.warn('Playback initiation error:', err);
      this.isPlaying = false;
      this.isLoading = false;
      this.error = 'ഓഡിയോ പ്ലേ ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി ഇന്റർനെറ്റ് പരിശോധിക്കുക.';
      this.notify();
    }
  }

  /**
   * Pause current playback.
   */
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.isLoading = false;
    this.notify();
  }

  /**
   * Resume paused playback.
   */
  async resume() {
    if (!this.currentDua) return;
    if (this.audio && this.audio.paused && this.audio.src) {
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.error = null;
        this.notify();
      } catch (err) {
        console.warn('Resume failed:', err);
        this.error = 'ഓഡിയോ പുനരാരംഭിക്കാൻ കഴിഞ്ഞില്ല.';
        this.notify();
      }
    } else if (this.currentDua) {
      this.playDua(this.currentDua);
    }
  }

  /**
   * Replay from the beginning (0:00).
   */
  async replay() {
    if (!this.audio || !this.currentDua) return;
    this.audio.currentTime = 0;
    this.currentTime = 0;
    this.progress = 0;
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.error = null;
      this.notify();
    } catch (err) {
      console.warn('Replay failed:', err);
      this.notify();
    }
  }

  /**
   * Stop audio and reset position.
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.isLoading = false;
    this.progress = 0;
    this.currentTime = 0;
    this.notify();
  }

  /**
   * Seek by percentage (0 to 100).
   */
  seek(percent) {
    this.progress = Math.min(100, Math.max(0, percent));
    if (this.audio && this.duration) {
      const targetTime = (this.progress / 100) * this.duration;
      this.audio.currentTime = targetTime;
      this.currentTime = targetTime;
    }
    this.notify();
  }

  /**
   * Set playback speed (0.75x, 1x, 1.25x, 1.5x).
   */
  setSpeed(speed) {
    this.speed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    this.notify();
  }

  /**
   * Toggle loop repeat mode.
   */
  toggleLoop() {
    this.isLoop = !this.isLoop;
    if (this.audio) {
      this.audio.loop = this.isLoop;
    }
    this.notify();
    return this.isLoop;
  }

  /**
   * Retry playback if an error occurred.
   */
  retry() {
    if (this.currentDua) {
      this.playDua(this.currentDua, this.speed, this.isLoop);
    }
  }

  /**
   * Subtle soft audio cue for tactile app interactions.
   */
  playChime(frequency = 520, volume = 0.04) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable or restricted
    }
  }
}

export const audioService = new AudioService();
