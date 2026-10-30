import React from 'react';
import { Heart, Play, Pause, BookOpen } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export default function DuaCard({ 
  dua, 
  isFavorite, 
  isPlaying, 
  onToggleFavorite, 
  onTogglePlay, 
  onSelectDua,
  settings 
}) {
  const category = CATEGORIES.find(c => c.id === dua.categoryId);
  const isEnglish = settings?.language === 'en';

  const categoryTitle = category ? (isEnglish ? category.titleEn : category.titleMl) : (isEnglish ? 'Dua' : 'ദുആ');
  const mainTitle = isEnglish ? dua.titleEn : dua.titleMl;
  const subTitle = isEnglish ? dua.titleMl : dua.titleEn;
  const meaningText = isEnglish && dua.meaningEn ? dua.meaningEn : dua.meaningMl;
  const countText = isEnglish ? `${dua.recommendedCount} times` : `${dua.recommendedCount} തവണ`;

  return (
    <article 
      className="dua-card" 
      onClick={() => onSelectDua(dua)}
      id={`dua-card-${dua.id}`}
    >
      <div className="dua-card-header">
        <div className="dua-card-meta">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span className="dua-badge">
              {categoryTitle}
            </span>
            {dua.recommendedCount > 1 && (
              <span className="dua-badge" style={{ backgroundColor: 'var(--accent-gold-soft)', color: 'var(--accent-gold)' }}>
                {countText}
              </span>
            )}
          </div>
          <h2 className="dua-card-title">{mainTitle}</h2>
          <span className="dua-card-subtitle">{subTitle}</span>
        </div>

        <button 
          className="icon-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(dua.id);
          }}
          title={isFavorite ? (isEnglish ? "Remove from favorites" : "ഫേവറിറ്റ്സിൽ നിന്ന് നീക്കുക") : (isEnglish ? "Add to favorites" : "ഫേവറിറ്റ്സിൽ ചേർക്കുക")}
          aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
          style={{
            color: isFavorite ? '#C0392B' : 'var(--text-tertiary)',
            backgroundColor: isFavorite ? 'rgba(192, 57, 43, 0.08)' : undefined
          }}
        >
          <Heart size={18} fill={isFavorite ? '#C0392B' : 'none'} strokeWidth={2} />
        </button>
      </div>

      <div className="arabic-text dua-card-arabic">
        {dua.arabic}
      </div>

      <p className="dua-card-meaning">
        {meaningText}
      </p>

      <div className="dua-card-footer">
        <div className="dua-ref-text" title={dua.reference}>
          <BookOpen size={13} style={{ flexShrink: 0 }} />
          <span>{dua.reference}</span>
        </div>

        <div className="dua-card-actions">
          <button 
            className="icon-btn"
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: isPlaying ? 'var(--primary)' : 'var(--bg-sage)',
              color: isPlaying ? 'white' : 'var(--primary)',
              border: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay(dua);
            }}
            title={isPlaying ? (isEnglish ? "Pause Audio" : "ഓഡിയോ നിർത്തുക") : (isEnglish ? "Play Audio" : "ഓഡിയോ കേൾക്കുക")}
            aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '1px' }} />}
          </button>
        </div>
      </div>
    </article>
  );
}
