import React from 'react';
import { BookOpen, Heart, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, favoritesCount = 0, language = 'ml' }) {
  const tabs = [
    { id: 'duas', labelMl: 'Duas', labelEn: 'Duas', icon: BookOpen },
    { id: 'favorites', labelMl: 'Favorites', labelEn: 'Favorites', icon: Heart, badge: favoritesCount },
    { id: 'settings', labelMl: 'Settings', labelEn: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const label = language === 'en' ? tab.labelEn : tab.labelMl;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="nav-icon-wrap" style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive && tab.id === 'favorites' ? 'currentColor' : 'none'} />
              {tab.badge > 0 && tab.id === 'favorites' && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-4px',
                  backgroundColor: '#C0392B',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  lineHeight: '1.2'
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
