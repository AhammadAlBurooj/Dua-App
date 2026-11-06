import React from 'react';
import { Home, Heart, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, favoritesCount = 0, language = 'ml' }) {
  const tabs = [
    { 
      id: 'duas', 
      label: language === 'en' ? 'Home' : 'ഹോം', 
      icon: Home 
    },
    { 
      id: 'favorites', 
      label: language === 'en' ? 'Favourites' : 'Favourites', 
      icon: Heart, 
      badge: favoritesCount 
    },
    { 
      id: 'settings', 
      label: language === 'en' ? 'Settings' : 'ക്രമീകരണങ്ങൾ', 
      icon: Settings 
    }
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main Navigation">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              aria-label={tab.label}
              title={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-icon-wrap">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.25 : 1.85} 
                  className="nav-icon-svg"
                />
                {tab.badge > 0 && tab.id === 'favorites' && (
                  <span className="nav-badge-count">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="nav-active-dot" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
