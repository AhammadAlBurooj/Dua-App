import React, { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 2.6s, then smoothly transition into app
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
        
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-arabic { font-family: 'Amiri', serif; }
        
        /* Sweeping Glare Animation */
        @keyframes sweep-glare {
          0% { transform: translateX(-150%) skewX(-20deg); }
          20% { transform: translateX(250%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        
        .animate-glare {
          animation: sweep-glare 5s infinite;
          background: linear-gradient(
            90deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.7) 50%, 
            rgba(255, 255, 255, 0) 100%
          );
        }

        /* Concentric Pulsing Rings */
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        .ring-1 {
          animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .ring-2 {
          animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s;
        }

        /* Gentle Float for the core icon */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Background Orb Pulse */
        @keyframes orb-pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        .animate-pulse-slow {
          animation: orb-pulse-slow 6s ease-in-out infinite;
        }

        .splash-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
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

      {/* Main Container - Soft off-white background */}
      <div 
        className={`splash-overlay relative min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden font-sans ${isFadingOut ? 'fade-out' : ''}`}
        onClick={handleDismiss}
        role="banner"
        aria-label="Munajat App Splash Screen"
      >
        {/* Background Glowing Orbs for Distortion & Depth */}
        <div 
          className="animate-pulse-slow"
          style={{
            position: 'absolute',
            top: 0,
            left: '-25%',
            width: '500px',
            height: '500px',
            backgroundColor: 'rgba(167, 243, 208, 0.5)', // emerald-200/50
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
            bottom: 0,
            right: '-25%',
            width: '600px',
            height: '600px',
            backgroundColor: 'rgba(153, 246, 228, 0.4)', // teal-200/40
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(150px)',
            animationDelay: '1s',
            pointerEvents: 'none'
          }}
        />
        
        {/* Central Glassmorphic Card */}
        <div 
          className="relative z-10 w-full max-w-[340px] px-8 py-16 flex flex-col items-center justify-center bg-white/40 backdrop-blur-2xl border border-white/60 shadow-xl rounded-[2.5rem] overflow-hidden"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '340px',
            padding: '64px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
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
              width: '75%',
              height: '100%',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />

          {/* Content Wrapper (Above Glare) */}
          <div 
            className="relative z-10 flex flex-col items-center w-full"
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            {/* Logo Area with Concentric Rings */}
            <div 
              style={{
                position: 'relative',
                width: '128px',
                height: '128px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px'
              }}
            >
              {/* Outer pulsing rings */}
              <div 
                className="ring-1"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  pointerEvents: 'none'
                }}
              />
              <div 
                className="ring-2"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  pointerEvents: 'none'
                }}
              />
              
              {/* Inner floating logo box */}
              <div 
                className="animate-float"
                style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid #FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}
              >
                <Moon 
                  className="w-8 h-8 text-emerald-600" 
                  size={32}
                  strokeWidth={1.5} 
                  style={{ color: '#059669' }}
                />
              </div>
            </div>

            {/* Typography */}
            <h1 
              className="font-arabic text-7xl font-bold text-emerald-900 mb-3 tracking-wide drop-shadow-sm"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: '4.5rem',
                fontWeight: 700,
                color: '#064E3B', // emerald-900
                marginBottom: '12px',
                letterSpacing: '0.025em',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))',
                lineHeight: 1.1,
                textAlign: 'center'
              }}
            >
              مناجاة
            </h1>
            <p 
              className="text-[11px] font-bold tracking-[0.4em] text-emerald-700/80 mb-14 uppercase"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.4em',
                color: 'rgba(4, 120, 87, 0.8)', // emerald-700/80
                marginBottom: '56px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Munajat
            </p>

            {/* Burooj 4 Tech Glass Pill */}
            <div 
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '9999px',
                boxShadow: 'inset 0 1px 5px rgba(255, 255, 255, 0.7), 0 4px 10px rgba(0, 0, 0, 0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span 
                className="text-[10px] font-bold tracking-[0.2em] text-emerald-800 uppercase"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#065F46', // emerald-800
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                Burooj 4 Tech
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
