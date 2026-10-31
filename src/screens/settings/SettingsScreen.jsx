import React, { useState } from 'react';
import { 
  Sliders, 
  Volume2, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Languages,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { UI_TEXT } from '../../utils/translations';

export default function SettingsScreen({ 
  settings, 
  onUpdateSettings, 
  theme, 
  onToggleTheme, 
  onShowToast, 
  totalDuasCount = 30,
  onShowSplash
}) {
  const [testNotificationShown, setTestNotificationShown] = useState(false);
  const lang = settings.language || 'ml';
  const t = UI_TEXT[lang] || UI_TEXT.ml;

  const handleToggle = (key) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleFontSizeChange = (e) => {
    onUpdateSettings({
      ...settings,
      arabicFontSize: Number(e.target.value)
    });
  };

  const handleLanguageChange = (selectedLang) => {
    onUpdateSettings({
      ...settings,
      language: selectedLang
    });
    onShowToast(selectedLang === 'ml' ? 'ആപ്പ് ഭാഷ മലയാളമാക്കി' : 'App language set to English');
  };

  const triggerTestNotification = () => {
    setTestNotificationShown(true);
    onShowToast(lang === 'en' 
      ? '🔔 Dua of the Day: Time to recite Sayyidul Istighfar!'
      : '🔔 ഇന്നത്തെ ദുആ: സയ്യിദുൽ ഇസ്തിഗ്ഫാർ ചൊല്ലാൻ സമയമായി!'
    );
    setTimeout(() => setTestNotificationShown(false), 4000);
  };

  return (
    <div className="settings-screen">
      <div style={{ marginBottom: '16px', paddingTop: '4px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
          {t.settingsTitle}
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '2px' }}>
          {t.settingsSubtitle}
        </p>
      </div>

      {/* 1. ഭാഷ & വിവർത്തന ക്രമീകരണങ്ങൾ (Language & Translation Settings) */}
      <div className="settings-section">
        <h3 className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Languages size={15} color="var(--primary)" />
          <span>{t.languageSection}</span>
        </h3>

        {/* App Interface Language Switcher */}
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">{t.appLanguageLabel}</span>
            <span className="settings-label-sub">{t.appLanguageSub}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`chip-btn ${lang === 'ml' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => handleLanguageChange('ml')}
            >
              മലയാളം
            </button>
            <button
              className={`chip-btn ${lang === 'en' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
          </div>
        </div>

        {/* English Translation Toggle */}
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {t.englishTranslationLabel}
            </span>
            <span className="settings-label-sub">{t.englishTranslationSub}</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.showMeaningEn !== false} 
              onChange={() => handleToggle('showMeaningEn')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* English Transliteration Toggle */}
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">{t.transliterationSettingLabel}</span>
            <span className="settings-label-sub">{t.transliterationSettingSub}</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.showTransliteration !== false} 
              onChange={() => handleToggle('showTransliteration')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Malayalam Translation Toggle */}
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">{t.malayalamTranslationLabel}</span>
            <span className="settings-label-sub">{t.malayalamTranslationSub}</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.showMeaningMl !== false} 
              onChange={() => handleToggle('showMeaningMl')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* 2. വായനയും ടൈപ്പോഗ്രാഫിയും (Reading & Typography) */}
      <div className="settings-section">
        <h3 className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={15} color="var(--primary)" />
          <span>{t.readingSection}</span>
        </h3>

        {/* Arabic Font Size Slider with Live Preview */}
        <div style={{ padding: '8px 0 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="settings-label-title">{t.arabicFontSizeLabel}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg-sage)', padding: '2px 8px', borderRadius: '10px' }}>
              {settings.arabicFontSize}px
            </span>
          </div>

          <input 
            type="range"
            min="20"
            max="42"
            value={settings.arabicFontSize}
            onChange={handleFontSizeChange}
            className="font-slider"
            aria-label="Arabic font size"
          />

          {/* Live Arabic Font Preview Card */}
          <div style={{
            marginTop: '12px',
            padding: '14px',
            backgroundColor: 'var(--bg-surface-soft)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '4px', letterSpacing: '0.5px' }}>
              {t.livePreview}
            </div>
            <div 
              className="arabic-text" 
              style={{ fontSize: `${settings.arabicFontSize}px`, color: 'var(--primary)', lineHeight: 2.1 }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>
        </div>
      </div>

      {/* 3. രൂപകൽപ്പന & തീം (Theme & Appearance) */}
      <div className="settings-section">
        <h3 className="settings-section-title">{t.themeSection}</h3>
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">
              {theme === 'dark' ? t.darkMode : t.lightMode}
            </span>
            <span className="settings-label-sub">
              {theme === 'dark' ? t.darkModeSub : t.lightModeSub}
            </span>
          </div>
          <button 
            className="icon-btn" 
            onClick={onToggleTheme}
            style={{ backgroundColor: 'var(--bg-sage)', color: 'var(--primary)' }}
            aria-label="Toggle light / dark mode"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* 4. ഓഡിയോ ക്രമീകരണങ്ങൾ (Audio Settings) */}
      <div className="settings-section">
        <h3 className="settings-section-title">{t.audioSection}</h3>
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">{t.audioSpeedLabel}</span>
            <span className="settings-label-sub">{t.audioSpeedSub}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0.8, 1.0, 1.25].map(speed => (
              <button
                key={speed}
                className={`chip-btn ${settings.audioSpeed === speed ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => onUpdateSettings({ ...settings, audioSpeed: speed })}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">{t.autoReplayLabel}</span>
            <span className="settings-label-sub">{t.autoReplaySub}</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.autoReplay === true} 
              onChange={() => handleToggle('autoReplay')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* 5. ഓഫ്ലൈൻ & സംഭരണം (Offline Storage Status) */}
      <div className="settings-section">
        <h3 className="settings-section-title">{t.offlineSection}</h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '6px 0' }}>
          <CheckCircle2 size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
              {t.offlineStatusTitle}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '3px', lineHeight: 1.5 }}>
              {t.offlineStatusDesc}
            </div>
          </div>
        </div>
      </div>

      {/* 6. ദൈനംദിന റിമൈൻഡറുകൾ (Daily Reminders) */}
      <div className="settings-section">
        <h3 className="settings-section-title">{t.reminderSection}</h3>
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-label-title">{t.reminderLabel}</span>
            <span className="settings-label-sub">{t.reminderSub}</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.dailyReminder !== false} 
              onChange={() => handleToggle('dailyReminder')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {settings.dailyReminder !== false && (
          <div style={{ marginTop: '10px' }}>
            <button 
              className="chip-btn"
              onClick={triggerTestNotification}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Bell size={13} />
              <span>{t.testNotificationBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* 7. വിശ്വാസ്യത & വിവരങ്ങൾ (Authenticity & About) */}
      <div className="settings-section">
        <h3 className="settings-section-title">{t.aboutSection}</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <ShieldCheck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-malayalam)' }}>
              {t.authenticityTitle}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-malayalam)', marginTop: '4px', lineHeight: 1.6 }}>
              {t.authenticityDesc}
            </p>
          </div>
        </div>

        {onShowSplash && (
          <div style={{ marginTop: '14px' }}>
            <button 
              className="chip-btn"
              onClick={onShowSplash}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <Sparkles size={13} color="var(--primary)" />
              <span>{lang === 'en' ? 'View Splash Screen' : 'സ്പ്ലാഷ് സ്ക്രീൻ കാണുക'}</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          <span>Created by Burooj 4 Tech App v1.0.0</span>
          <span>{lang === 'en' ? 'Simple • Serene • Authentic' : 'Simple • Serene • Authentic'}</span>
        </div>
      </div>
    </div>
  );
}
