import React, { useState } from 'react';
import { 
  Languages, 
  Moon, 
  Bell, 
  Share2, 
  Star, 
  Info, 
  ChevronDown, 
  ChevronRight, 
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import './SettingsScreen.css';

export default function SettingsScreen({ 
  settings = {}, 
  onUpdateSettings, 
  theme = 'light', 
  onToggleTheme, 
  onShowToast, 
  onShowSplash 
}) {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const lang = (settings.language === 'en') ? 'en' : 'ml';
  const isEnglish = lang === 'en';

  // Toggle Language between Malayalam & English
  const handleToggleLanguage = () => {
    const nextLang = lang === 'ml' ? 'en' : 'ml';
    onUpdateSettings({
      ...settings,
      language: nextLang
    });
    if (onShowToast) {
      onShowToast(nextLang === 'ml' ? 'ഭാഷ മലയാളമാക്കി മാറ്റി' : 'Language set to English');
    }
  };

  // Daily reminder toggle
  const handleToggleReminder = () => {
    const nextState = settings.dailyReminder === false ? true : false;
    onUpdateSettings({
      ...settings,
      dailyReminder: nextState
    });
    if (onShowToast) {
      onShowToast(nextState 
        ? (isEnglish ? 'Daily notifications turned ON 🔔' : 'ദൈനംദിന അറിയിപ്പുകൾ ഓണാക്കി 🔔') 
        : (isEnglish ? 'Notifications turned OFF' : 'അറിയിപ്പുകൾ ഓഫാക്കി'));
    }
  };

  // Share app handler
  const handleShareApp = async () => {
    const shareData = {
      title: 'مناجاة - Munajat Islamic Dua App',
      text: 'Download Munajat Islamic Dua & Adhkar App - 464 Authentic Duas with Malayalam translation and audio.',
      url: window.location.origin || 'https://play.google.com/store/apps/details?id=com.burooj.munajat'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        if (onShowToast) onShowToast(isEnglish ? 'App link copied! 📋' : 'ആപ്പ് ലിങ്ക് കോപ്പി ചെയ്തു! 📋');
      } catch {
        if (onShowToast) onShowToast('Munajat Dua App v2.0.1');
      }
    }
  };

  // Rate on Play Store handler
  const handleRateApp = () => {
    try {
      window.open('market://details?id=com.burooj.munajat', '_blank');
    } catch {
      window.open('https://play.google.com/store/apps/details?id=com.burooj.munajat', '_blank');
    }
    if (onShowToast) {
      onShowToast(isEnglish ? 'Welcome to Play Store ⭐' : 'പ്ലേസ്റ്റോറിലേക്ക് സ്വാഗതം ⭐');
    }
  };

  const isDarkMode = theme === 'dark';

  return (
    <div className="settings-screen-container">
      {/* 1. Header Section Matching Reference */}
      <div className="settings-header-wrap">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your app preferences</p>
      </div>

      {/* 2. PREFERENCES Section */}
      <div className="settings-group-label">Preferences</div>
      <div className="settings-card">
        {/* Item 1: Translation Language */}
        <div className="settings-item-row">
          <div className="settings-item-left">
            <div className="settings-icon-badge">
              <Languages size={20} />
            </div>
            {/* <div className="settings-item-text">
              <h3 className="settings-item-title">Translation Language</h3>
              <p className="settings-item-sub">
                Currently selected: {isEnglish ? 'English' : 'Malayalam'}
              </p>
            </div> */}

            <div className="settings-item-text disabled"> {/* disabled */}
  <h3 className="settings-item-title">Translation Language</h3>
  <p className="settings-item-sub">(Beta)</p>
</div>
          </div>
          

          <button 
            className="settings-lang-select-btn" // disabled 
            onClick={handleToggleLanguage}
            title="Change translation language"
            aria-label="Change translation language"
          >
            <span>{isEnglish ? 'English' : 'Malayalam'}</span>
            <ChevronDown size={15} />
          </button>
        </div>

        <div className="settings-divider" />

        {/* Item 2: Dark Mode */}
        <div className="settings-item-row">
          <div className="settings-item-left">
            <div className="settings-icon-badge">
              <Moon size={20} />
            </div>
            <div className="settings-item-text">
              <h3 className="settings-item-title">Dark Mode</h3>
              <p className="settings-item-sub">Switch to dark theme</p>
            </div>
          </div>

          <button
            role="switch"
            aria-checked={isDarkMode}
            className={`settings-switch ${isDarkMode ? 'is-active' : ''}`}
            onClick={onToggleTheme}
            aria-label="Toggle Dark Mode"
          >
            <span className="settings-switch-thumb" />
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATIONS Section */}
      <div className="settings-group-label">Notifications</div>
      <div className="settings-card">
        <div className="settings-item-row">
          <div className="settings-item-left">
            <div className="settings-icon-badge">
              <Bell size={20} />
            </div>
            <div className="settings-item-text">
              <h3 className="settings-item-title">Daily Reminder</h3>
              <p className="settings-item-sub">Get notified for morning & evening Adhkar</p>
            </div>
          </div>

          <button
            role="switch"
            aria-checked={settings.dailyReminder !== false}
            className={`settings-switch ${settings.dailyReminder !== false ? 'is-active' : ''}`}
            onClick={handleToggleReminder}
            aria-label="Toggle Daily Reminder"
          >
            <span className="settings-switch-thumb" />
          </button>
        </div>
      </div>

      {/* 4. GENERAL Section */}
      <div className="settings-group-label">General</div>
      <div className="settings-card">
        {/* Share App */}
        <div 
          className="settings-item-row disabled"
          style={{ opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' }}
          aria-disabled="true"
        >
          <div className="settings-item-left">
            <div className="settings-icon-badge">
              <Share2 size={19} />
            </div>
            <div className="settings-item-text">
              <h3 className="settings-item-title">Share App</h3>
               <p className="settings-item-sub">(Beta)</p>
            </div>
          </div>
          <ChevronRight size={18} className="settings-chevron" />
        </div>

        <div className="settings-divider" />

        {/* Rate Us on Play Store */}
        <div 
          className="settings-item-row disabled"
          style={{ opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' }}
          aria-disabled="true"
        >
          <div className="settings-item-left">
            <div className="settings-icon-badge">
              <Star size={19} />
            </div>
            <div className="settings-item-text">
              <h3 className="settings-item-title">Rate Us on Play Store</h3>
               <p className="settings-item-sub">(Beta)</p>

            </div>
          </div>
          <ChevronRight size={18} className="settings-chevron" />
        </div>

        <div className="settings-divider" />

        {/* About App */}
        <div 
          className="settings-item-row is-clickable"
          onClick={() => setShowAboutModal(true)}
          role="button"
          tabIndex={0}
        >
          <div className="settings-item-left">
            <div className="settings-icon-badge">
              <Info size={19} />
            </div>
            <div className="settings-item-text">
              <h3 className="settings-item-title">About App</h3>
            </div>
          </div>
          <ChevronRight size={18} className="settings-chevron" />
        </div>
      </div>

      {/* 5. Version Info */}
      <p className="settings-version-text">Munajat Version 2.0.1</p>

      {/* About App Dialog Modal */}
      {showAboutModal && (
        <div 
          className="settings-modal-backdrop" 
          onClick={() => setShowAboutModal(false)}
        >
          <div 
            className="settings-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={() => setShowAboutModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldCheck size={36} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>مناجاة (Munajat)</h3>
            <p style={{ fontSize: '13px', color: '#059669', fontWeight: 600, margin: '0 0 14px 0' }}>Version 2.0.1</p>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted, #64748B)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              Authentic Islamic Duas & Adhkar from Quran & Sunnah with full Malayalam translations, transliterations, word-by-word meanings, and audio recitation.
            </p>

            <div style={{ fontSize: '12px', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '14px', marginBottom: '16px' }}>
              Developed with devotion by <strong>Burooj 4 Tech</strong>
                <div style={{ fontSize: '12px', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '14px', marginBottom: '16px' }}>
              App logo designed by <strong>Swalih</strong>
              
            </div>
             </div>

            {onShowSplash && (
              <button 
                className="fav-explore-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setShowAboutModal(false);
                  onShowSplash();
                }}
              >
                <Sparkles size={16} />
                <span>View Splash Screen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
