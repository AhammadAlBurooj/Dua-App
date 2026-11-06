import React, { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 2.6s, then smoothly transition out
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 2600);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 650);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Amiri:wght@400;700&display=swap');
        
        .splash-font-sans { font-family: 'Outfit', sans-serif; }
        .splash-font-arabic { font-family: 'Amiri', serif; }
        
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .animate-shimmer {
          animation: shimmer-slide 2s infinite ease-in-out;
        }

        /* Float animation for the inner glass box */
        @keyframes splash-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-splash-float {
          animation: splash-float 4s ease-in-out infinite;
        }

        /* Pulse for background glowing orbs */
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.06); }
        }
        .animate-splash-pulse {
          animation: splash-pulse 5s ease-in-out infinite;
        }

        .splash-overlay-container {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #064E3B 0%, #115E59 50%, #0F172A 100%);
          overflow: hidden;
          transition: opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1), 
                      transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), 
                      filter 0.65s ease;
          user-select: none;
          cursor: pointer;
        }

        .splash-overlay-container.fade-out {
          opacity: 0;
          pointer-events: none;
          transform: scale(1.03);
          filter: blur(8px);
        }
      `}</style>

      {/* Main Container - Dark Rich Gradient */}
      <div 
        className={`splash-overlay-container splash-font-sans ${isFadingOut ? 'fade-out' : ''}`}
        onClick={handleDismiss}
        role="banner"
        aria-label="Munajat App Splash Screen"
      >
        {/* Background Glowing Orbs for Depth */}
        <div 
          className="animate-splash-pulse"
          style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '300px',
            height: '300px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '50%',
            mixBlendMode: 'screen',
            filter: 'blur(100px)',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="animate-splash-pulse"
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '25%',
            width: '400px',
            height: '400px',
            backgroundColor: 'rgba(45, 212, 191, 0.1)',
            borderRadius: '50%',
            mixBlendMode: 'screen',
            filter: 'blur(120px)',
            animationDelay: '1s',
            pointerEvents: 'none'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '250px',
            height: '250px',
            backgroundColor: 'rgba(110, 231, 183, 0.1)',
            borderRadius: '50%',
            mixBlendMode: 'screen',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }}
        />
        
        {/* Central Glassmorphic Card */}
        <div 
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '340px',
            padding: '56px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
            borderRadius: '2.5rem',
            margin: '0 18px',
            boxSizing: 'border-box'
          }}
        >
          {/* Inner Glass Icon Box */}
          <div 
            className="animate-splash-float"
            style={{
              width: '64px',
              height: '64px',
              marginBottom: '32px',
              borderRadius: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: 'inset 0 1px 10px rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Moon 
              size={28} 
              style={{ color: '#D1FAE5', zIndex: 10 }} 
              strokeWidth={1.5} 
            />
            {/* Subtle glow behind the icon */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(52, 211, 153, 0.25)',
                filter: 'blur(18px)',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Typography */}
          <h1 
            className="splash-font-arabic"
            style={{
              fontSize: '4.5rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '8px',
              letterSpacing: '0.02em',
              filter: 'drop-shadow(0 2px 10px rgba(255, 255, 255, 0.22))',
              lineHeight: 1.1,
              textAlign: 'center'
            }}
          >
            مناجاة
          </h1>
          <p 
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.4em',
              color: 'rgba(209, 250, 229, 0.72)',
              marginBottom: '60px',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            Munajat
          </p>

          {/* Minimal Loading Indicator */}
          <div 
            style={{
              width: '192px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div 
              className="animate-shimmer"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '50%',
                background: 'linear-gradient(to right, #34D399, #99F6E4)',
                borderRadius: '9999px',
                boxShadow: '0 0 10px rgba(52, 211, 153, 0.8)'
              }}
            />
          </div>
          
          {/* Branding */}
          <div 
            style={{
              marginTop: '32px',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: 'rgba(209, 250, 229, 0.52)',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            Burooj 4 Tech
          </div>
        </div>
      </div>
    </>
  );
}
