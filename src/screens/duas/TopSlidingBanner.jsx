import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import './TopSlidingBanner.css';

export default function TopSlidingBanner({
  onSelectCategory,
  onNavigateTab: _onNavigateTab,
  onOpenAsmaulHusna,
  searchQuery = '',
  onSearchChange,
  settings
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchStartTime = useRef(0);
  const isDragging = useRef(false);
  const lastSwipeTime = useRef(0);
  const lastActionTime = useRef(0);
  const autoPlayResumeTimer = useRef(null);

  const lang = settings?.language || 'ml';
  const isEnglish = lang === 'en';

  const slides = [
    {
      id: 1,
      tag: 'DAILY ADHKAR',
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
      title: isEnglish ? 'Asmaul Husna' : 'അസ്മാഉൽ ഹുസ്ന',
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

  // Helper to safely schedule auto-play resume after user interaction
  const scheduleAutoPlayResume = (delayMs = 4000) => {
    if (autoPlayResumeTimer.current) {
      clearTimeout(autoPlayResumeTimer.current);
    }
    autoPlayResumeTimer.current = setTimeout(() => {
      setIsPaused(false);
    }, delayMs);
  };

  // Auto-play functionality (every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Clean up autoPlayResumeTimer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayResumeTimer.current) {
        clearTimeout(autoPlayResumeTimer.current);
      }
    };
  }, []);

  // Centralized safe action trigger with debounce to eliminate duplicate calls
  const triggerSlideAction = (slide) => {
    if (!slide || !slide.action) return;
    const now = Date.now();
    if (now - lastActionTime.current < 400) {
      return;
    }
    lastActionTime.current = now;
    slide.action();
  };

  // Touch handlers with drag threshold to cleanly separate swipe from click
  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    touchStartX.current = x;
    touchStartY.current = y;
    touchEndX.current = x; // Reset to start pos so zero delta if no move occurs
    touchStartTime.current = Date.now();
    isDragging.current = false;

    // Immediately pause auto-play on touch
    setIsPaused(true);
    if (autoPlayResumeTimer.current) {
      clearTimeout(autoPlayResumeTimer.current);
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return;
    touchEndX.current = e.touches[0].clientX;
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // If movement exceeds 12px, mark as dragging so clicks don't misfire during an intentional swipe
    if (deltaX > 12 || deltaY > 12) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    const endX = touchEndX.current || touchStartX.current;
    const diff = touchStartX.current - endX;
    const endY = e.changedTouches?.[0]?.clientY ?? touchStartY.current;
    const diffY = Math.abs((touchStartY.current || 0) - endY);
    const elapsed = Date.now() - (touchStartTime.current || 0);

    // Genuine horizontal swipe: threshold > 35px and more horizontal than vertical
    if (Math.abs(diff) > 35 && Math.abs(diff) > diffY) {
      lastSwipeTime.current = Date.now();
      isDragging.current = true;
      if (diff > 0) {
        // Swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      } else {
        // Swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    } else if (Math.abs(diff) <= 12 && diffY <= 12 && elapsed < 350 && !isDragging.current) {
      // Immediate response on the first tap: execute action instantly without waiting for synthetic click
      const slideEl = e.target?.closest?.('[data-slide-index]');
      const tappedIdx = slideEl ? parseInt(slideEl.getAttribute('data-slide-index'), 10) : currentIndex;
      const targetSlide = slides[tappedIdx] || slides[currentIndex];
      if (targetSlide) {
        triggerSlideAction(targetSlide);
      }
    }

    // Reset touch coordinates so subsequent quick taps never inherit stale drag values
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;

    // Reset dragging flag after a brief delay
    setTimeout(() => {
      isDragging.current = false;
    }, 150);

    // Resume auto-play only after a calm delay (4 seconds)
    scheduleAutoPlayResume(4000);
  };

  // Safe click handler that triggers for desktop clicks or browser synthetic clicks
  const handleCardClick = (e, slide) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Suppress clicks that occur during or immediately following a drag/swipe gesture
    if (Date.now() - lastSwipeTime.current < 400 || isDragging.current) {
      return;
    }
    triggerSlideAction(slide);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    scheduleAutoPlayResume(4000);
  };

  // Smooth scroll listener for animated Munajat header transformation
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scrollContainer = document.getElementById('main-content') || window;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = scrollContainer === window 
            ? window.scrollY 
            : (scrollContainer.scrollTop || 0);
          // Transition completes smoothly between 0px and 95px of scroll
          const p = Math.min(1, Math.max(0, scrollY / 95));
          setScrollProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleHeaderClick = () => {
    if (scrollProgress > 0.25) {
      const scrollContainer = document.getElementById('main-content');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* 2. Scroll-Responsive Animated Sticky Munajat Header */}
      <header 
        className={`munajat-sticky-header ${scrollProgress >= 0.85 ? 'is-sticky' : ''}`}
        style={{
          '--sp': scrollProgress
        }}
        onClick={handleHeaderClick}
        role="banner"
        aria-label="Munajat Header"
      >
        <div className="munajat-header-branding">
          <div className="munajat-logo-wrap">
            <img 
              src="/munajat_logo.png" 
              alt="Munajat Logo" 
              className="munajat-header-logo"
            />
          </div>
          <span className="munajat-header-title">
            Munajat
          </span>
        </div>
      </header>

      {/* 3. Top Banner Content Area */}
      <div className="top-banner-content-wrap">
        {/* Placeholder reserving layout space for the prominent initial header */}
        <div className="munajat-header-placeholder" />

        {/* Carousel Container */}
        <div 
          className="top-banner-carousel-wrap"
          onMouseEnter={() => {
            setIsPaused(true);
            if (autoPlayResumeTimer.current) clearTimeout(autoPlayResumeTimer.current);
          }}
          onMouseLeave={() => scheduleAutoPlayResume(2000)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Track */}
          <div 
            className="top-banner-carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className="top-banner-carousel-slide" data-slide-index={index}>
                {/* Glassmorphic Card - Curved Type with Glass Shine */}
                <div 
                  className="glass-shine top-banner-card"
                  onClick={(e) => handleCardClick(e, slide)}
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
                      handleCardClick(e, slide);
                    }}
                  >
                    <span>{isEnglish ? 'Explore Now!' : 'കാണുക'}</span>
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
              onClick={() => handleDotClick(index)}
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
