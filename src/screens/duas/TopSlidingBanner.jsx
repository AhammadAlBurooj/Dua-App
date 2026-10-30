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
      tag: 'Quran',
      title: isEnglish ? 'Read & Listen' : 'ഖുർആൻ ദുആകൾ',
      subtitle: isEnglish ? 'Explore the Holy Quran' : 'ഖുർആനിക പ്രാർത്ഥനകൾ',
      buttonText: isEnglish ? 'Explore' : 'തുറക്കുക',
      buttonTheme: 'white', // white button with dark green text
      cardBg: 'linear-gradient(135deg, #124838 0%, #175B46 60%, #1D6B53 100%)',
      cardTheme: 'dark',
      image: '/quran_card.jpg',
      imagePosition: 'left',
      action: () => onSelectCategory('quranic')
    },
    {
      id: 'asmaul_husna',
      tag: '99 Names',
      title: 'Asmaul Husna',
      subtitle: isEnglish ? '99 Beautiful Names' : 'അസ്മാഉൽ ഹുസ്നാ • 99 നാമങ്ങൾ',
      buttonText: isEnglish ? 'Explore' : 'കാണുക',
      buttonTheme: 'dark-green', // dark green button with white text
      cardBg: '#FDFBF7',
      cardTheme: 'light',
      image: '/asmaul_husna.jpg',
      imagePosition: 'center',
      action: () => onOpenAsmaulHusna()
    },
    {
      id: 'daily_duas',
      tag: isEnglish ? 'Daily Supplications' : 'ദൈനംദിന പ്രാർത്ഥനകൾ',
      title: isEnglish ? 'Daily Duas' : 'നിത്യജീവിത ദുആകൾ',
      subtitle: isEnglish ? 'Morning & Evening Supplications' : 'പ്രഭാത & സായാഹ്ന ദിക്റുകൾ',
      buttonText: isEnglish ? 'Explore' : 'വായിക്കുക',
      buttonTheme: 'gold', // warm golden button
      cardBg: 'linear-gradient(135deg, #1B4D3E 0%, #2A6F55 60%, #8A6D3B 100%)',
      cardTheme: 'dark',
      image: '/daily_duas.jpg',
      imagePosition: 'left',
      action: () => onSelectCategory('daily')
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
          src="/banner.png" 
          alt="Islamic Mosque Banner" 
          className="banner-scenic-img" 
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
            <h1 className="banner-title-en">Islamic Dua</h1>
            <h2 className="banner-title-ml">ദുആകൾ</h2>
            <p className="banner-tagline">
              {isEnglish ? "Supplications to draw closer to Allah..." : "അല്ലാഹുവിലേക്ക് കൂടുതൽ അടുക്കാനുള്ള പ്രാർത്ഥനകൾ.."}
            </p>
          </div>
        </div>

        {/* Right Top Action Buttons: Bookmark & Settings */}
        <div className="banner-header-actions">
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
        </div>
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
                {/* Left/Graphic section */}
                <div className={`slide-artwork-col position-${slide.imagePosition}`}>
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="slide-artwork-img" 
                  />
                </div>

                {/* Content section */}
                <div className="slide-content-col">
                  <span className="slide-tag-pill">
                    {slide.tag}
                  </span>

                  <h3 className="slide-heading-text">
                    {slide.title}
                  </h3>

                  <p className="slide-desc-text">
                    {slide.subtitle}
                  </p>

                  <button 
                    className={`slide-explore-btn btn-${slide.buttonTheme}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      slide.action();
                    }}
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight size={14} strokeWidth={2.4} />
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
          placeholder={isEnglish ? "Search duas..." : "Search duas..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery ? (
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
        )}
      </div>
    </div>
  );
}
