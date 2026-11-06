import React, { useState, useEffect, useRef } from 'react';
import { 
  Bookmark, 
  Settings as SettingsIcon, 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowRight,
  BookOpen,
  Sparkles,
  SunMedium
} from 'lucide-react';
import { UI_TEXT } from '../../utils/translations';

export default function TopSlidingBanner({
  onSelectCategory,
  onNavigateTab,
  onOpenAsmaulHusna,
  searchQuery,
  onSearchChange,
  settings,
  onOpenFilter
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseStartX = useRef(0);
  const isMouseDown = useRef(false);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  // 3 Slides matching user request: Quran Duas, Asmaul Husna, Daily Duas
  const slides = [
    {
      id: 'quran',
      tag: isEnglish ? 'Holy Quran' : 'QURAN',
      title: isEnglish ? 'Quranic Duas' : 'ഖുർആൻ ദുആകൾ',
      subtitle: isEnglish ? 'Supplications from the Quran' : 'ഖുർആനിക പ്രാർത്ഥനകൾ',
      buttonText: isEnglish ? 'Explore' : 'തുറക്കുക',
      buttonTheme: 'white',
      cardBg: 'linear-gradient(135deg, #073325 0%, #0F4936 50%, #175F47 100%)',
      cardTheme: 'dark',
      image: '/quran_card.jpg',
      imagePosition: 'left',
      action: () => (onSelectCategory ? onSelectCategory('cat_21') : null)
    },
    {
      id: 'asmaul_husna',
      tag: isEnglish ? '99 Names' : '99 Names',
      title: isEnglish ? 'Asmaul Husna' : 'Asmaul Husna',
      subtitle: isEnglish ? '99 Beautiful Divine Names' : 'അല്ലാഹുവിന്റെ 99 വിശുദ്ധ നാമങ്ങൾ',
      buttonText: isEnglish ? 'Explore' : 'കാണുക',
      buttonTheme: 'gold',
      cardBg: 'linear-gradient(135deg, #093327 0%, #144937 45%, #563E14 100%)',
      cardTheme: 'dark',
      image: '/asmaul_husna.jpg',
      imagePosition: 'left',
      action: () => (onOpenAsmaulHusna ? onOpenAsmaulHusna() : null)
    },
    {
      id: 'daily_duas',
      tag: isEnglish ? 'Daily Adhkar' : 'Daily Adhkar',
      title: isEnglish ? 'Daily Supplications' : 'നിത്യജീവിത ദുആകൾ',
      subtitle: isEnglish ? 'Morning & Evening Supplications' : 'പ്രഭാത & സായാഹ്ന പ്രാർത്ഥനകൾ',
      buttonText: isEnglish ? 'Explore' : 'കാണുക',
      buttonTheme: 'white',
      cardBg: 'linear-gradient(135deg, #083427 0%, #114F3B 50%, #1A6B52 100%)',
      cardTheme: 'dark',
      image: '/daily_duas.jpg',
      imagePosition: 'left',
      action: () => (onSelectCategory ? onSelectCategory('cat_1') : null)
    }
  ];

  // Auto-sliding interval (4.5s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setCurrentSlide(prev => (prev + 1) % slides.length);
      } else {
        // swipe right -> prev
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      }
    }
  };

  // Mouse Drag handlers for desktop
  const handleMouseDown = (e) => {
    mouseStartX.current = e.clientX;
    isMouseDown.current = true;
    setIsPaused(true);
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    setIsPaused(false);
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      } else {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      }
    }
  };

  return (
    <div className="top-sliding-banner-container">
      {/* Background Scenic Mosque Header */}
      <div className="banner-mosque-backdrop">
        <img 
          src="/image.png" 
          alt="Islamic Mosque Banner" 
          className="banner-scenic-img" 
          onError={(e) => { e.currentTarget.src = '/banner.png'; }}
        />
        <div className="banner-backdrop-overlay" />
      </div>

      {/* Top Bar Row: Islamic Dua Title (Left) & Bookmark / Settings (Right) */}
      <div className="banner-header-row">
        <div className="banner-app-brand">
          <div className="banner-logo-wrap">
            {/* Mosque SVG Icon matching screenshot */}
            <svg viewBox="0 0 44 44" fill="none" className="banner-mosque-logo-svg">
              <path d="M22 6 L22 10" stroke="#175B46" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M22 6 A4 4 0 0 1 24.5 9.5 A3.5 3.5 0 1 0 22 6 Z" fill="#175B46" />
              <path d="M12 28 C12 18, 22 13, 22 13 C22 13, 32 18, 32 28 Z" fill="#175B46" />
              <rect x="7" y="22" width="3.5" height="15" rx="1.5" fill="#175B46" />
              <path d="M6 22 L8.75 18 L11.5 22 Z" fill="#175B46" />
              <rect x="33.5" y="22" width="3.5" height="15" rx="1.5" fill="#175B46" />
              <path d="M32.5 22 L35.25 18 L38 22 Z" fill="#175B46" />
              <rect x="12" y="28" width="20" height="9" fill="#175B46" />
              <path d="M19 37 A3 3 0 0 1 25 37 Z" fill="#F4EDE4" />
            </svg>
          </div>

          <div className="banner-brand-text">
            <h1 className="banner-title-en">مناجاة</h1>
            {/* <h2 className="banner-title-ml">ദുആകൾ</h2> */}
            <p className="banner-tagline">
              {/* {isEnglish ? "Supplications to draw closer to Allah..." : "അല്ലാഹുവിലേക്ക് കൂടുതൽ അടുക്കാനുള്ള പ്രാർത്ഥനകൾ.."} */}
            </p>
          </div>
        </div>

        {/* Right Top Action Buttons: Bookmark & Settings */}
        {/* <div className="banner-header-actions">
          <button 
            className="banner-round-action-btn"
            onClick={() => onNavigateTab && onNavigateTab('bookmarks')}
            title={isEnglish ? "Bookmarks" : "ബുക്ക്മാർക്കുകൾ"}
            aria-label="Bookmarks"
          >
            <Bookmark size={18} strokeWidth={2.2} />
          </button>

          <button 
            className="banner-round-action-btn"
            onClick={() => onNavigateTab && onNavigateTab('settings')}
            title={isEnglish ? "Settings" : "ക്രമീകരണങ്ങൾ"}
            aria-label="Settings"
          >
            <SettingsIcon size={18} strokeWidth={2.2} />
          </button>
        </div> */}
      </div>

      {/* Sliding Cards Carousel */}
      <div 
        className="banner-carousel-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="banner-carousel-track"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="banner-carousel-slide">
              <div 
                className={`banner-slide-card theme-${slide.cardTheme}`}
                style={{ background: slide.cardBg }}
                onClick={slide.action}
              >
                {/* Decorative background radial glow & Islamic 8-point star watermark */}
                <div className="slide-card-glow" aria-hidden="true" />
                <div className="slide-card-watermark" aria-hidden="true">
                  <svg width="130" height="130" viewBox="0 0 100 100" fill="none">
                    <path 
                      d="M50 2 L63.6 15.6 L84.4 15.6 L84.4 36.4 L98 50 L84.4 63.6 L84.4 84.4 L63.6 84.4 L50 98 L36.4 84.4 L15.6 84.4 L15.6 63.6 L2 50 L15.6 36.4 L15.6 15.6 L36.4 15.6 Z" 
                      stroke="rgba(255, 255, 255, 0.13)" 
                      strokeWidth="1.5" 
                      fill="rgba(255, 255, 255, 0.02)" 
                    />
                    <circle cx="50" cy="50" r="28" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="14" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                  </svg>
                </div>

                {/* Left/Graphic section */}
                <div className={`slide-artwork-col position-${slide.imagePosition}`}>
                  <div className="slide-artwork-frame">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="slide-artwork-img" 
                      loading="eager"
                    />
                    <div className="slide-artwork-shine" aria-hidden="true" />
                  </div>
                </div>

                {/* Content section */}
                <div className="slide-content-col">
                  <div className="slide-tag-pill">
                    <span className="slide-tag-dot" />
                    <span>{slide.tag}</span>
                  </div>

                  <h3 className="slide-heading-text">
                    {slide.title}
                  </h3>

                  <p className="slide-desc-text">
                    {slide.subtitle}
                  </p>

                  <button 
                    type="button"
                    className={`slide-explore-btn btn-${slide.buttonTheme}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      slide.action();
                    }}
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight size={13} className="slide-btn-arrow" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Pagination Dots */}
      <div className="banner-carousel-dots">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            className={`carousel-dot-indicator ${currentSlide === idx ? 'active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Floating Search Bar with Filter Icon matching Screenshot */}
      <div className="banner-floating-search-bar">
        <Search size={19} className="search-icon-left-floating" />
        <input 
          type="text"
          className="floating-search-input"
          placeholder={isEnglish ? "Search" : "Search"}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {/* {searchQuery ? (
          <button 
            className="search-clear-btn-floating" 
            onClick={() => onSearchChange('')}
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        ) : (
          <button 
            className="search-filter-btn-floating"
            onClick={onOpenFilter}
            title={isEnglish ? "Filters" : "ഫിൽട്ടർ"}
            aria-label="Filters"
          >
            <SlidersHorizontal size={17} strokeWidth={2.2} />
          </button>
        )} */}
      </div>
    </div>
  );
}
