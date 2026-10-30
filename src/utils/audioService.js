/**
 * High-performance Islamic Dua Audio Engine.
 * Plays real recitation audio from OpenDua (recited by Muhammad Jumah)
 * and Quranic recitations, with automatic preloading, scrubbing, playback speed,
 * looping, and fallback to Web Speech Synthesis when offline.
 */

class AudioService {
  constructor() {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : null;
    this.currentDua = null;
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = 0;
    this.duration = 10;
    this.speed = 1.0;
    this.isLoop = false;
    this.reciter = 'Muhammad Jumah (OpenDua)';
    this.onStateChangeCallbacks = new Set();
    this.audioCache = new Map();

    // Fallback synth
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.timer = null;

    this.setupAudioListeners();
  }

  setupAudioListeners() {
    if (!this.audio) return;

    this.audio.preload = 'auto';

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      this.currentTime = this.audio.currentTime || 0;
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
        this.progress = (this.currentTime / this.duration) * 100;
      }
      this.notify();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
        this.notify();
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.isLoop && this.currentDua) {
        this.currentTime = 0;
        this.progress = 0;
        this.audio.currentTime = 0;
        this.audio.play().catch(console.warn);
      } else {
        this.stop();
      }
    });

    this.audio.addEventListener('error', (err) => {
      console.warn('HTML5 Audio failed, falling back to speech synthesis', err);
      if (this.currentDua) {
        this.playSpeechSynthesisFallback(this.currentDua);
      }
    });
  }

  subscribe(callback) {
    this.onStateChangeCallbacks.add(callback);
    callback(this.getState());
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.onStateChangeCallbacks.forEach(cb => cb(state));
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      currentDuaId: this.currentDua ? this.currentDua.id : null,
      currentDua: this.currentDua,
      progress: this.progress,
      currentTime: this.currentTime,
      duration: this.duration,
      speed: this.speed,
      isLoop: this.isLoop,
      reciter: this.reciter
    };
  }

  playDua(dua, speed = this.speed, loop = this.isLoop) {
    if (!dua) return;
    this.stop();

    this.currentDua = dua;
    this.speed = speed;
    this.isLoop = loop;
    this.currentTime = 0;
    this.progress = 0;
    this.reciter = dua.reciter || 'Muhammad Jumah (OpenDua)';

    // Play subtle soft start tone
    this.playChime(540, 0.04);

    // If authentic OpenDua or Quranic audio URL exists
    if (this.audio && dua.audioUrl) {
      this.audio.src = dua.audioUrl;
      this.audio.playbackRate = this.speed;
      this.audio.loop = this.isLoop;

      // Start playback fast
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.notify();
          })
          .catch(err => {
            console.warn('Audio play was prevented or failed:', err);
            // Fallback to speech synthesis
            this.playSpeechSynthesisFallback(dua);
          });
      }
    } else {
      // Fallback
      this.playSpeechSynthesisFallback(dua);
    }

    this.notify();
  }

  playSpeechSynthesisFallback(dua) {
    if (!this.synth) {
      this.simulatePlayback(dua);
      return;
    }

    this.isPlaying = true;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(dua.arabic);
    const voices = this.synth.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || null;
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85 * this.speed;

    const words = dua.arabic.split(/\s+/).length;
    this.duration = Math.max(4, Math.round((words * 0.85) / this.speed));

    utterance.onend = () => {
      if (this.isLoop && this.isPlaying) {
        this.playDua(dua, this.speed, this.isLoop);
      } else {
        this.stop();
      }
    };

    utterance.onerror = () => {
      this.stop();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch {
      this.simulatePlayback(dua);
    }

    // Timer for speech synth progress tracking
    const intervalMs = 100;
    const step = intervalMs / 1000;
    this.timer = setInterval(() => {
      this.currentTime += step;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.progress = 100;
        this.notify();
      } else {
        this.progress = (this.currentTime / this.duration) * 100;
        this.notify();
      }
    }, intervalMs);

    this.notify();
  }

  simulatePlayback(dua) {
    this.isPlaying = true;
    const words = dua.arabic.split(/\s+/).length;
    this.duration = Math.max(4, Math.round((words * 0.85) / this.speed));
    const intervalMs = 100;
    const step = intervalMs / 1000;

    this.timer = setInterval(() => {
      this.currentTime += step;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.progress = 100;
        this.notify();
        if (this.isLoop) {
          this.playDua(dua, this.speed, this.isLoop);
        } else {
          this.stop();
        }
      } else {
        this.progress = (this.currentTime / this.duration) * 100;
        this.notify();
      }
    }, intervalMs);
  }

  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isPlaying = false;
    this.notify();
  }

  resume(dua) {
    if (!this.currentDua && dua) {
      this.playDua(dua);
      return;
    }

    if (this.audio && this.audio.paused && this.audio.src) {
      this.audio.play().catch(console.warn);
      this.isPlaying = true;
      this.notify();
    } else if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPlaying = true;
      this.notify();
    } else if (dua) {
      this.playDua(dua);
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = 0;
    this.notify();
  }

  seek(percent) {
    this.progress = Math.min(100, Math.max(0, percent));
    if (this.audio && this.duration) {
      const targetTime = (this.progress / 100) * this.duration;
      this.audio.currentTime = targetTime;
      this.currentTime = targetTime;
    } else {
      this.currentTime = (this.progress / 100) * this.duration;
    }
    this.notify();
  }

  setSpeed(speed) {
    this.speed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    this.notify();
  }

  toggleLoop() {
    this.isLoop = !this.isLoop;
    if (this.audio) {
      this.audio.loop = this.isLoop;
    }
    this.notify();
    return this.isLoop;
  }

  playChime(frequency = 520, volume = 0.04) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
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
      // AudioContext not supported or restricted, ignore
    }
  }
}

export const audioService = new AudioService();
