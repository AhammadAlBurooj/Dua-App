import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Animate progress bar from 15% to 100%
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 12;
      });
    }, 280);

    // Auto dismiss after 2.8 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 2800);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 450); // wait for fade out transition
  };

  return (
    <div 
      className={`splash-screen-overlay ${isFadingOut ? 'fade-out' : ''}`}
      onClick={handleDismiss}
      role="banner"
      aria-label="App Splash Screen"
    >
      {/* Background Poster Image */}
      <div className="splash-image-wrapper">
        <img 
          src="/splash.jpg" 
          alt="Adhkar by Burooj 4 Tech" 
          className="splash-hero-image"
          onError={(e) => {
            // Fallback in case of path issue
            e.currentTarget.src = '/banner.png';
          }}
        />
        {/* Soft Vignette Overlay */}
        <div className="splash-vignette-overlay" />
      </div>

      {/* Bottom Loading Progress & Skip Action */}
      <div className="splash-bottom-controls" onClick={e => e.stopPropagation()}>
        <div className="splash-progress-track">
          <div 
            className="splash-progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="splash-footer-row">
          <span className="splash-status-text">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>

          <button 
            className="splash-skip-btn"
            onClick={handleDismiss}
            aria-label="Enter App"
          >
            <span>തുടങ്ങുക</span>
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
