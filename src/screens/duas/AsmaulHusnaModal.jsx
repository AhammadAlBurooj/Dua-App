import React, { useState } from 'react';
import { X, Search, Sparkles, BookOpen, Volume2, Check } from 'lucide-react';
import { ASMAUL_HUSNA } from '../../data/asmaulHusna';
import { UI_TEXT } from '../../utils/translations';

export default function AsmaulHusnaModal({ isOpen, onClose, settings }) {
  const [search, setSearch] = useState('');
  const [selectedName, setSelectedName] = useState(null);

  if (!isOpen) return null;

  const isEnglish = settings?.language === 'en';

  const filtered = ASMAUL_HUSNA.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.transliteration.toLowerCase().includes(q) ||
      item.meaningMl.toLowerCase().includes(q) ||
      item.meaningEn.toLowerCase().includes(q) ||
      item.arabic.includes(search) ||
      String(item.id) === search.trim()
    );
  });

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-sheet asmaul-husna-sheet"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-top-bar" style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #175B46 0%, #124838 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8D49E',
                boxShadow: '0 2px 8px rgba(18, 72, 56, 0.25)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-malayalam)' }}>
                {isEnglish ? "99 Names of Allah" : "അസ്മാഉൽ ഹുസ്നാ • 99 നാമങ്ങൾ"}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {isEnglish ? "Asmaul Husna with authentic meanings" : "അല്ലാഹുവിന്റെ തിരുനാമങ്ങളും അർത്ഥങ്ങളും"}
              </span>
            </div>
          </div>

          <button 
            className="icon-btn" 
            onClick={onClose}
            aria-label="Close"
            style={{ backgroundColor: 'var(--bg-surface-soft)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search within 99 Names */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-app)' }}>
          <div className="search-bar-wrap" style={{ margin: 0 }}>
            <Search size={16} className="search-icon-left" />
            <input 
              type="text"
              className="search-input"
              placeholder={isEnglish ? "Search names or meanings..." : "നാമങ്ങൾ അല്ലെങ്കിൽ അർത്ഥം തിരയുക..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: '13.5px', height: '42px' }}
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 99 Names Grid List */}
        <div 
          className="modal-content-scroll" 
          style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 30px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {filtered.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedName(selectedName?.id === item.id ? null : item)}
                style={{
                  background: selectedName?.id === item.id 
                    ? 'linear-gradient(135deg, rgba(23,91,70,0.08) 0%, rgba(200,169,106,0.12) 100%)' 
                    : 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: selectedName?.id === item.id ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                  padding: '14px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                {/* Number Badge */}
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    left: '10px', 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    color: 'var(--text-tertiary)',
                    background: 'var(--bg-surface-soft)',
                    padding: '1px 6px',
                    borderRadius: '8px'
                  }}
                >
                  #{item.id}
                </span>

                {/* Arabic Calligraphy */}
                <div 
                  className="arabic-text"
                  style={{ 
                    fontSize: '22px', 
                    color: 'var(--primary)', 
                    marginTop: '8px', 
                    marginBottom: '4px',
                    lineHeight: 1.6
                  }}
                >
                  {item.arabic}
                </div>

                {/* Transliteration */}
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                  {item.transliteration}
                </div>

                {/* Meaning */}
                <div 
                  style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)', 
                    fontFamily: 'var(--font-malayalam)',
                    lineHeight: 1.35
                  }}
                >
                  {isEnglish ? item.meaningEn : item.meaningMl}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <p className="empty-title">{isEnglish ? "No names found" : "നാമങ്ങൾ കണ്ടെത്താനായില്ല"}</p>
              <p className="empty-desc">{isEnglish ? "Try another search term." : "മറ്റൊരു പദം നൽകി തിരയുക."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
