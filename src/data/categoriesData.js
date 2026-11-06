/**
 * Complete Category & Subcategory Catalog with Duas (Awraad Database)
 * Features:
 * - 20 Comprehensive Islamic Life Categories
 * - 157 Structured Subcategories
 * - 464 Authentic Duas & Adhkar
 * - Full Arabic Text with Complete Tashkeel & Harakat
 * - Word-by-word breakdowns (പദാനുപദ അർത്ഥം)
 * - Complete Malayalam translations, transliterations, and Hadith references
 * - Cloudflare Worker studio audio URLs
 */

import awraadData from './awraad.json';
import { DUAS as LEGACY_DUAS } from './duasData';

const ARABIC_CAT_NAMES = {
  1: "الحَيَاةُ اليَومِيَّةُ",
  2: "الصَّلَاةُ",
  3: "أَذْكَارُ الصَّبَاحِ وَالمَسَاءِ",
  4: "النَّوْمُ وَالإِسْتِيقَاظُ",
  5: "المَسْجِدُ",
  6: "السَّفَرُ",
  7: "الصِّيَامُ وَالطَّعَامُ",
  8: "المَرَضُ وَالجَنَائِزُ",
  9: "الإِيمَانُ وَالتَّوْحِيدُ",
  10: "الشُّكْرُ وَالحَمْدُ",
  11: "التَّوْبَةُ وَالإِسْتِغْفَارُ",
  12: "الكَرْبُ وَالهَمُّ",
  13: "الإِسْتِعَاذَةُ مِنَ الشَّيْطَانِ",
  14: "الحِمَايَةُ مِنَ العَدُوِّ",
  15: "الرِّيَاحُ وَالأَمْطَارُ",
  16: "النِّكَاحُ وَالأُسْرَةُ",
  17: "الأَخْلَاقُ وَالمُعَامَلَةُ",
  18: "الحَجُّ وَالعُمْرَةُ",
  19: "أَدْعِيَةٌ عَامَّةٌ",
  20: "المُلْحَقَاتُ",
  21: "أَدْعِيَةٌ مِنَ القُرْآنِ"
};

const duasById = new Map();
if (awraadData && Array.isArray(awraadData.duas)) {
  awraadData.duas.forEach(d => {
    if (d && d.id !== undefined) {
      duasById.set(d.id, d);
    }
  });
}

const subCatsById = new Map();
if (awraadData && Array.isArray(awraadData.sub_categories)) {
  awraadData.sub_categories.forEach(sc => {
    if (sc && sc.id !== undefined) {
      subCatsById.set(sc.id, sc);
    }
  });
}

export const QURANIC_DUA_IDS = [
  345, 313, 346, 287, 348, 396, 349, 350, 
  351, 352, 353, 354, 355, 361, 356, 357, 
  358, 359, 360, 361, 364, 365, 367, 368, 
  369, 370, 372, 374, 375, 376, 377, 378, 
  380, 381, 379, 382, 384, 385, 386, 387, 
  388, 389, 390, 391, 392, 393, 394
];

const quranDuas = QURANIC_DUA_IDS.map((id, index) => {
  const d = duasById.get(id);
  if (!d) return null;
  const cleanRef = (d.ref || '').replace(/—?\s*Shared via Munajat App/gi, '').trim();
  const isSecond361 = id === 361 && index === 19;
  return {
    ...d,
    id: isSecond361 ? '361_q2' : d.id,
    originalId: d.id,
    ref: cleanRef
  };
}).filter(Boolean);

export const QURAN_CATEGORY = {
  id: 'cat_21',
  originalId: 21,
  name: 'ഖുർആനിലെ ദുആകൾ',
  nameArabic: 'أَدْعِيَةٌ مِنَ القُرْآنِ',
  icon: 'quran.png',
  subcategories: [
    {
      id: 'sub_2101',
      originalId: 2101,
      name: 'ഖുർആനിലെ പ്രാർത്ഥനകൾ',
      nameArabic: 'أَدْعِيَةٌ مِنَ القُرْآنِ الكَرِيمِ',
      duas: quranDuas
    }
  ]
};

export const CATEGORIES_DATA = [
  ...(awraadData?.categories || []).map(cat => ({
    id: `cat_${cat.id}`,
    originalId: cat.id,
    name: cat.title,
    nameArabic: ARABIC_CAT_NAMES[cat.id] || "",
    icon: cat.icon || "",
    subcategories: (cat.sub_cats || [])
      .map(subId => subCatsById.get(subId))
      .filter(Boolean)
      .map(sc => ({
        id: `sub_${sc.id}`,
        originalId: sc.id,
        name: sc.title,
        nameArabic: sc.title_arabic || "",
        duas: (sc.duas || []).map(dId => {
          const rawD = duasById.get(dId);
          if (!rawD) return null;
          return {
            ...rawD,
            ref: (rawD.ref || '').replace(/—?\s*Shared via Munajat App/gi, '').trim()
          };
        }).filter(Boolean)
      }))
  })),
  QURAN_CATEGORY
];

export const ALL_DUAS = awraadData?.duas || [];
export const ASMAUL_HUSNA_RAW = awraadData?.asmaul_husna || [];
export const COLLECTIONS = awraadData?.collections || {};

// Map each dua to its parent category and subcategory info
const duaToCategoryMap = new Map();
(awraadData?.categories || []).forEach(cat => {
  (cat.sub_cats || []).forEach(subId => {
    const sc = subCatsById.get(subId);
    if (sc && Array.isArray(sc.duas)) {
      sc.duas.forEach(dId => {
        if (!duaToCategoryMap.has(dId)) {
          duaToCategoryMap.set(dId, {
            categoryId: `cat_${cat.id}`,
            categoryOriginalId: cat.id,
            categoryName: cat.title,
            categoryArabic: ARABIC_CAT_NAMES[cat.id] || "",
            subCategoryId: `sub_${sc.id}`,
            subCategoryOriginalId: sc.id,
            subCategoryName: sc.title,
            subCategoryArabic: sc.title_arabic || ""
          });
        }
      });
    }
  });
});

/**
 * Normalized catalog of all 464 Awraad Duas with unified property names
 * Compatible with both DuaCard and CategoryDuaReader
 */
export const NORMALIZED_AWRAAD_DUAS = (awraadData?.duas || []).map(d => {
  const meta = duaToCategoryMap.get(d.id);
  const audioFullUrl = d.audio_url 
    ? (d.audio_url.startsWith('http') ? d.audio_url : `https://crimson-cell-3d4c.mubarakar95.workers.dev/${d.audio_url}.mp3`) 
    : '';

  return {
    ...d,
    id: String(d.id),
    originalId: d.id,
    categoryId: meta?.categoryId || 'daily',
    categoryOriginalId: meta?.categoryOriginalId || 1,
    categoryTitle: meta?.categoryName || 'ദുആ',
    subCategoryId: meta?.subCategoryId || '',
    subCategoryOriginalId: meta?.subCategoryOriginalId || null,
    subCategoryTitle: meta?.subCategoryName || '',
    titleMl: d.desc || d.hint || `ദുആ #${d.id}`,
    titleEn: d.hint ? `Dua #${d.id} • ${d.hint}` : `Dua #${d.id}`,
    arabic: d.dua || '',
    meaningMl: d.trans || '',
    meaningEn: '',
    transliteration: d.transli || '',
    reference: (d.ref || '').replace(/—?\s*Shared via Munajat App/gi, '').trim(),
    audioUrl: audioFullUrl,
    recommendedCount: 1
  };
});

export const ALL_UNIFIED_DUAS = [
  ...LEGACY_DUAS,
  ...NORMALIZED_AWRAAD_DUAS.filter(ad => !LEGACY_DUAS.some(ld => String(ld.id) === String(ad.id)))
];

export const CATEGORY_THEMES = {
  1: { bg: '#059669', border: '#059669', accent: '#059669', nameEn: 'Daily Life' },
  2: { bg: '#059669', border: '#059669', accent: '#16A34A', nameEn: 'Prayer & Salah' },
  3: { bg: '#059669', border: '#059669', accent: '#D97706', nameEn: 'Morning & Evening' },
  4: { bg: '#059669', border: '#059669', accent: '#4F46E5', nameEn: 'Sleep & Waking' },
  5: { bg: '#059669', border: '#059669', accent: '#15803D', nameEn: 'Mosque & Adhan' },
  6: { bg: '#059669', border: '#059669', accent: '#0891B2', nameEn: 'Travel & Journey' },
  7: { bg: '#059669', border: '#059669', accent: '#EA580C', nameEn: 'Fasting & Meals' },
  8: { bg: '#059669', border: '#059669', accent: '#E11D48', nameEn: 'Illness & Healing' },
  9: { bg: '#059669', border: '#059669', accent: '#7C3AED', nameEn: 'Faith & Tawheed' },
  10: { bg: '#059669', border: '#059669', accent: '#CA8A04', nameEn: 'Gratitude & Praise' },
  11: { bg: '#059669', border: '#059669', accent: '#0D9488', nameEn: 'Repentance (Tawbah)' },
  12: { bg: '#059669', border: '#059669', accent: '#475569', nameEn: 'Relief from Distress' },
  13: { bg: '#059669', border: '#059669', accent: '#DC2626', nameEn: 'Shaytan Protection' },
  14: { bg: '#059669', border: '#059669', accent: '#DB2777', nameEn: 'Protection & Safety' },
  15: { bg: '#059669', border: '#059669', accent: '#0284C7', nameEn: 'Weather & Nature' },
  16: { bg: '#059669', border: '#059669', accent: '#C026D3', nameEn: 'Marriage & Family' },
  17: { bg: '#059669', border: '#059669', accent: '#10B981', nameEn: 'Etiquette & Conduct' },
  18: { bg: '#059669', border: '#059669', accent: '#B45309', nameEn: 'Hajj & Umrah' },
  19: { bg: '#059669', border: '#059669', accent: '#64748B', nameEn: 'General Duas' },
  20: { bg: '#059669', border: '#059669', accent: '#475569', nameEn: 'Appendix & Virtues' },
  21: { bg: '#059669', border: '#059669', accent: '#059669', nameEn: 'Quranic Duas' }
};
