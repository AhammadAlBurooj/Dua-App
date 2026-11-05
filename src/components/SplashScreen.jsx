import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 2.2s, then trigger smooth fade out
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 2200);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    // 700ms allows the silky cubic-bezier fade-out and scale transition to complete
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 700);
  };

  return (
    <div 
      className={`splash-screen-overlay ${isFadingOut ? 'fade-out' : ''}`}
      onClick={handleDismiss}
      role="banner"
      aria-label="Munajat App Splash Screen"
    >
      <div className="splash-image-wrapper">
        <img 
          src="/splash.jpg" 
          alt="Munajat by Burooj 4 Tech" 
          className="splash-hero-image"
          onError={(e) => {
            // Fallback in case of path resolution
            e.currentTarget.src = '/splash2.png';
          }}
        />
        {/* Subtle luminous ambient edge glow */}
        <div className="splash-soft-glow-overlay" />
      </div>
    </div>
  );
}
