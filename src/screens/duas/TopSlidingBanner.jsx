import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import './TopSlidingBanner.css';

export default function TopSlidingBanner({
  onSelectCategory,
  onNavigateTab,
  onOpenAsmaulHusna,
  searchQuery = '',
  onSearchChange,
  settings
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  const slides = [
    {
      id: 1,
      tag: 'DAILY AAR',
      tagDot: 'dot-emerald',
      title: isEnglish ? 'Daily Adhkar' : 'നിത്യജീവിത ദുആകൾ',
      subtitle: isEnglish ? 'Morning & Evening Supplications' : 'പ്രഭാത & സായാഹ്ന പ്രാർത്ഥനകൾ',
      image: '/daily_duas.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1590076214309-88dd22359480?q=80&w=400&auto=format&fit=crop',
      buttonClass: 'top-banner-btn-white',
      titleFont: 'font-malayalam',
      action: () => (onSelectCategory ? onSelectCategory('cat_1') : null)
    },
    {
      id: 2,
      tag: '99 NAMES',
      tagDot: 'dot-emerald',
      title: 'അസ്മാഉൽ ഹുസ്ന',
      subtitle: isEnglish ? '99 Beautiful Names of Allah' : 'അല്ലാഹുവിന്റെ 99 വിശുദ്ധ നാമങ്ങൾ',
      image: '/asmaul_husna.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1582298960012-706d860d5b12?q=80&w=400&auto=format&fit=crop',
      buttonClass: 'top-banner-btn-gold',
      titleFont: 'font-sans',
      action: () => (onOpenAsmaulHusna ? onOpenAsmaulHusna() : null)
    },
    {
      id: 3,
      tag: 'HOLY QURAN',
      tagDot: 'dot-blue',
      title: isEnglish ? 'Quranic Duas' : 'ഖുർആൻ ദുആകൾ',
      subtitle: isEnglish ? 'Supplications from the Holy Quran' : 'വിശുദ്ധ ഖുർആനിലെ പ്രാർത്ഥനകൾ',
      image: '/quran_card.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1603525141042-3e2b26090e82?q=80&w=400&auto=format&fit=crop',
      buttonClass: 'top-banner-btn-white',
      titleFont: 'font-malayalam',
      action: () => (onSelectCategory ? onSelectCategory('cat_21') : null)
    }
  ];

  // Auto-play functionality (every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Touch handlers for smooth swiping on mobile
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
        // Swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      } else {
        // Swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    }
  };

  return (
    <div className="top-sliding-banner-container font-sans">
      {/* 1. Scenic Background Image matching top banner area */}
      <div 
        className="top-banner-scenic-backdrop"
        style={{
          backgroundImage: "url('/scenic_mosque_bg.jpg')"
        }}
      >
        <div className="top-banner-green-overlay" />
      </div>

      {/* 2. Top Banner Content Area */}
      <div className="top-banner-content-wrap">
        {/* Glassmorphic Top Bar with Mosque Logo & Brand Name */}
        <div className="top-banner-glass-bar">
          <svg className="top-banner-logo-svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C12 2 14 5 14 7C14 8.1 13.1 9 12 9C10.9 9 10 8.1 10 7C10 5 12 2 12 2ZM9 10H15V13H9V10ZM4 14H20V22H15V17C15 15.34 13.66 14 12 14C10.34 14 9 15.34 9 17V22H4V14ZM4 11V13H2V22H4V11ZM22 11V13H20V22H22V11Z" />
          </svg>
          <span className="top-banner-brand-arabic">مناجاة</span>
        </div>

        {/* Carousel Container */}
        <div 
          className="top-banner-carousel-wrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Track */}
          <div 
            className="top-banner-carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="top-banner-carousel-slide">
                {/* Glassmorphic Card - Curved Type with Glass Shine */}
                <div 
                  className="glass-shine top-banner-card"
                  onClick={slide.action}
                  role="button"
                  tabIndex={0}
                  aria-label={slide.title}
                >
                  {/* Tag Header */}
                  <div className="top-banner-tag-wrap">
                    <div className="top-banner-tag">
                      <span className={`top-banner-tag-dot ${slide.tagDot}`} />
                      <span>{slide.tag}</span>
                    </div>
                  </div>

                  {/* Content (Artwork + Title + Subtitle) */}
                  <div className="top-banner-content">
                    <div className="top-banner-art-wrap">
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="top-banner-art-img"
                        onError={(e) => {
                          if (slide.fallbackImage && e.currentTarget.src !== slide.fallbackImage) {
                            e.currentTarget.src = slide.fallbackImage;
                          }
                        }}
                      />
                    </div>

                    <h2 className={`top-banner-title ${slide.titleFont}`}>
                      {slide.title}
                    </h2>

                    <p className="top-banner-subtitle">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button 
                    type="button"
                    className={`top-banner-action-btn ${slide.buttonClass}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      slide.action && slide.action();
                    }}
                  >
                    <span>കാണുക</span>
                    <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="top-banner-dots" role="tablist" aria-label="Banner slides">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`top-banner-dot ${index === currentIndex ? 'active' : 'inactive'}`}
              aria-label={`Go to slide ${index + 1}`}
              role="tab"
              aria-selected={index === currentIndex}
            />
          ))}
        </div>

        {/* Floating Search Bar */}
        {onSearchChange && (
          <div className="top-banner-search-bar">
            <Search size={19} className="top-banner-search-icon" />
            <input 
              type="text"
              className="top-banner-search-input"
              placeholder={isEnglish ? "Search" : "Search"}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search"
            />
          </div>
        )}
      </div>
    </div>
  );
}
