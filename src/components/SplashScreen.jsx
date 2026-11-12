import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 2.8s, then smoothly transition into app
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 2300);

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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-arabic { font-family: 'Amiri', serif; }
        
        /* 1. Arch Draw Animation (Smooth SVG stroke-dash animated entry of golden arch dome) */
        @keyframes draw-arch-stroke {
          0% {
            stroke-dashoffset: 600;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        .splash-arch-stroke-left,
        .splash-arch-stroke-right {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: draw-arch-stroke 1.1s cubic-bezier(0.35, 0, 0.25, 1) 0.15s forwards;
        }

        /* Arch texture layer smooth fade-in */
        @keyframes arch-texture-fade {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(231, 176, 76, 0.45));
          }
        }

        .splash-arch-img {
          opacity: 0;
          animation: arch-texture-fade 0.8s ease-out 0.85s forwards;
        }

        /* 2. Calligraphy Fade-In (Scale & opacity entrance for central Arabic calligraphy) */
        @keyframes calligraphy-entrance {
          0% {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(5px);
          }
          60% {
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }

        .splash-calligraphy-img {
          opacity: 0;
          transform: scale(0.92);
          animation: calligraphy-entrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.65s forwards;
        }

        /* 3. Bottom Diamond Pop (Pulsing gold star/diamond accent entrance) */
        @keyframes diamond-pop {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          65% {
            opacity: 1;
            transform: scale(1.35);
            filter: drop-shadow(0 0 16px rgba(231, 176, 76, 0.95));
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(231, 176, 76, 0.6));
          }
        }

        @keyframes diamond-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 5px rgba(231, 176, 76, 0.55));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 12px rgba(231, 176, 76, 0.9));
          }
        }

        .splash-diamond-img {
          opacity: 0;
          transform: scale(0);
          animation: diamond-pop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 1.35s forwards,
                     diamond-pulse 2.2s ease-in-out 2.0s infinite;
        }

        /* Title text fade */
        @keyframes title-fade-in {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .splash-title-text {
          opacity: 0;
          animation: title-fade-in 0.7s ease-out 1.1s forwards;
        }

        /* 4. Bottom Branding & Loading UX Animations */
        @keyframes branding-fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .splash-branding-wrap {
          opacity: 0;
          animation: branding-fade-in 0.8s ease-out 1.25s forwards;
        }

        @keyframes loading-progress {
          0% {
            width: 0%;
          }
          25% {
            width: 35%;
          }
          70% {
            width: 82%;
          }
          100% {
            width: 100%;
          }
        }

        .splash-loading-fill {
          animation: loading-progress 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }

        /* Sweeping Glare Animation */
        @keyframes sweep-glare {
          0% { transform: translateX(-150%) skewX(-20deg); }
          25% { transform: translateX(250%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        
        .animate-glare {
          animation: sweep-glare 5s infinite;
          background: linear-gradient(
            90deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.65) 50%, 
            rgba(255, 255, 255, 0) 100%
          );
        }

        /* Background Orb Pulse */
        @keyframes orb-pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
        .animate-pulse-slow {
          animation: orb-pulse-slow 6s ease-in-out infinite;
        }

        /* Full Overlay Dismiss Transition */
        .splash-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #FAF9F4;
          overflow: hidden;
          transition: opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1), 
                      transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), 
                      filter 0.65s ease;
          user-select: none;
          cursor: pointer;
        }

        .splash-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
          transform: scale(1.03);
          filter: blur(8px);
        }
      `}</style>

      {/* Main Container */}
      <div 
        className={`splash-overlay relative min-h-screen flex items-center justify-center overflow-hidden font-sans ${isFadingOut ? 'fade-out' : ''}`}
        onClick={handleDismiss}
        role="banner"
        aria-label="Munajat App Splash Screen"
      >
        {/* Background Glowing Ambient Orbs */}
        <div 
          className="animate-pulse-slow"
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-15%',
            width: '520px',
            height: '520px',
            backgroundColor: 'rgba(167, 243, 208, 0.45)', // emerald-200
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(120px)',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="animate-pulse-slow"
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-15%',
            width: '560px',
            height: '560px',
            backgroundColor: 'rgba(254, 240, 138, 0.35)', // gold-yellow-200
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(130px)',
            animationDelay: '1.2s',
            pointerEvents: 'none'
          }}
        />
        
        {/* Central Glassmorphic Card */}
        <div 
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '360px',
            padding: '48px 28px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1.5px solid rgba(255, 255, 255, 0.75)',
            boxShadow: '0 25px 45px -10px rgba(15, 65, 40, 0.08), 0 10px 15px -5px rgba(0, 0, 0, 0.02)',
            borderRadius: '2.5rem',
            overflow: 'hidden',
            boxSizing: 'border-box',
            margin: '0 20px'
          }}
        >
          {/* Sweeping Glare Element (Behind Content) */}
          <div 
            className="animate-glare"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '80%',
              height: '100%',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />

          {/* Content Wrapper */}
          <div 
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            {/* Animated Logo Stage (Arch Draw + Calligraphy Fade-In + Diamond Pop) */}
            <div 
              style={{
                position: 'relative',
                width: '260px',
                height: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}
            >
              {/* 1. Animated SVG Stroke-Dash Golden Arch */}
              <svg 
                viewBox="0 0 1024 1024"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 4
                }}
              >
                <defs>
                  <linearGradient id="goldArchGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#C59B27" />
                    <stop offset="45%" stopColor="#F5D77F" />
                    <stop offset="100%" stopColor="#E7B04C" />
                  </linearGradient>
                </defs>
                {/* Left Pillar & Arch Dome Curve */}
                <path 
                  d="M 310 560 L 310 294 C 310 180 410 90 515 84" 
                  fill="none" 
                  stroke="url(#goldArchGradient)" 
                  strokeWidth="7" 
                  strokeLinecap="round" 
                  className="splash-arch-stroke-left"
                />
                {/* Right Pillar & Arch Dome Curve */}
                <path 
                  d="M 714 560 L 714 294 C 714 180 620 90 515 84" 
                  fill="none" 
                  stroke="url(#goldArchGradient)" 
                  strokeWidth="7" 
                  strokeLinecap="round" 
                  className="splash-arch-stroke-right"
                />
              </svg>

              {/* Arch Layer Texture (Authentic golden dome texture reveal) */}
              <img 
                src="/splash_layer_arch.png"
                alt="Munajat Arch"
                className="splash-arch-img"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  zIndex: 3
                }}
              />

              {/* 2. Arabic Calligraphy Layer (Elegant scale and opacity entrance) */}
              <img 
                src="/splash_layer_calligraphy.png"
                alt="Munajat Calligraphy"
                className="splash-calligraphy-img"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  zIndex: 2,
                  filter: 'drop-shadow(0 2px 8px rgba(15, 65, 40, 0.12))'
                }}
              />

              {/* 3. Bottom Diamond Layer (Pulsing gold star/diamond accent entrance) */}
              <img 
                src="/splash_layer_diamond.png"
                alt="Golden Diamond Star"
                className="splash-diamond-img"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
            </div>

            {/* App Subtitle Typography
            <div className="splash-title-text" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p 
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.45em',
                  color: '#047857', // emerald-700
                  margin: '0',
                  textTransform: 'uppercase',
                  paddingLeft: '0.45em' // compensate for wide letter-spacing
                }}
              >
                MUNAJAT
              </p>
              <p
                style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  color: '#065F46',
                  opacity: 0.75,
                  letterSpacing: '0.08em',
                  margin: '4px 0 0 0'
                }}
              >
                Daily Duas & Supplications
              </p>
            </div> */}

            {/* 4. Bottom Branding & Loading UX */}
            <div 
              className="splash-branding-wrap"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              {/* Developer Branding: Clean, premium typography displaying Burooj 4 Tech */}
              <div 
                style={{
                  padding: '7px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 8px rgba(15, 65, 40, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span 
                  style={{
                    fontSize: '8.5px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    color: '#6B7280',
                    textTransform: 'uppercase'
                  }}
                >
               
                </span>
                <span 
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#0F5132',
                    textTransform: 'uppercase'
                  }}
                >
                  Burooj 4 Tech
                </span>
              </div>

              {/* Loading UX: Sleek minimal progress track */}
              {/* <div 
                style={{
                  width: '110px',
                  height: '3px',
                  backgroundColor: 'rgba(15, 65, 40, 0.08)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div 
                  className="splash-loading-fill"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    background: 'linear-gradient(90deg, #059669 0%, #D9A74A 100%)',
                    borderRadius: '9999px',
                    width: '0%'
                  }}
                />
              </div> */}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
