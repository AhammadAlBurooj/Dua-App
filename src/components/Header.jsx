import React from 'react';
import { Moon, Sun, Smartphone, Maximize2 } from 'lucide-react';

export default function Header({ 
  theme, 
  onToggleTheme, 
  isFullWidth, 
  onToggleWidth,
  activeTab,
  language = 'ml'
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString(language === 'en' ? 'en-US' : 'ml-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-badge" title="Dua App">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
            <path d="M6 14h6" />
          </svg>
        </div>
        <div className="header-title-wrap">
          <h1>
            Dua 
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
              {language === 'en' ? 'Supplications' : 'ദുആ'}
            </span>
          </h1>
          <div className="header-subtitle">{dateStr}</div>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="icon-btn" 
          onClick={onToggleWidth}
          title={isFullWidth ? (language === 'en' ? "Switch to mobile view" : "മൊബൈൽ വ്യൂവിലേക്ക് മാറ്റുക") : (language === 'en' ? "Switch to full view" : "ഫുൾ സ്ക്രീൻ വ്യൂവിലേക്ക് മാറ്റുക")}
          aria-label="Toggle mobile / full view"
        >
          {isFullWidth ? <Smartphone size={17} /> : <Maximize2 size={17} />}
        </button>

        <button 
          className="icon-btn" 
          onClick={onToggleTheme}
          title={theme === 'dark' ? (language === 'en' ? "Light mode" : "ലൈറ്റ് മോഡ്") : (language === 'en' ? "Dark mode" : "ഡാർക്ക് മോഡ്")}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
