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
  20: "المُلْحَقَاتُ"
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

export const CATEGORIES_DATA = (awraadData?.categories || []).map(cat => ({
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
      duas: (sc.duas || []).map(dId => duasById.get(dId)).filter(Boolean)
    }))
}));

export const ALL_DUAS = awraadData?.duas || [];
export const ASMAUL_HUSNA_RAW = awraadData?.asmaul_husna || [];
export const COLLECTIONS = awraadData?.collections || {};

export const CATEGORY_THEMES = {
  1: { bg: '#000000ff', border: '#000000ff', accent: '#059669', nameEn: 'Daily Life' },
  2: { bg: '#005effff', border: '#005effff', accent: '#16A34A', nameEn: 'Prayer & Salah' },
  3: { bg: '#000000ff', border: '#000000ff', accent: '#D97706', nameEn: 'Morning & Evening' },
  4: { bg: '#005effff', border: '#005effff', accent: '#4F46E5', nameEn: 'Sleep & Waking' },
  5: { bg: '#000000ff', border: '#000000ff', accent: '#15803D', nameEn: 'Mosque & Adhan' },
  6: { bg: '#005effff', border: '#005effff', accent: '#0891B2', nameEn: 'Travel & Journey' },
  7: { bg: '#000000ff', border: '#000000ff', accent: '#EA580C', nameEn: 'Fasting & Meals' },
  8: { bg: '#005effff', border: '#005effff', accent: '#E11D48', nameEn: 'Illness & Healing' },
  9: { bg: '#000000ff', border: '#000000ff', accent: '#7C3AED', nameEn: 'Faith & Tawheed' },
  10: { bg: '#005effff', border: '#005effff', accent: '#CA8A04', nameEn: 'Gratitude & Praise' },
  11: { bg: '#000000ff', border: '#000000ff', accent: '#0D9488', nameEn: 'Repentance (Tawbah)' },
  12: { bg: '#005effff', border: '#005effff', accent: '#475569', nameEn: 'Relief from Distress' },
  13: { bg: '#000000ff', border: '#000000ff', accent: '#DC2626', nameEn: 'Shaytan Protection' },
  14: { bg: '#005effff', border: '#005effff', accent: '#DB2777', nameEn: 'Protection & Safety' },
  15: { bg: '#000000ff', border: '#000000ff', accent: '#0284C7', nameEn: 'Weather & Nature' },
  16: { bg: '#005effff', border: '#005effff', accent: '#C026D3', nameEn: 'Marriage & Family' },
  17: { bg: '#000000ff', border: '#000000ff', accent: '#10B981', nameEn: 'Etiquette & Conduct' },
  18: { bg: '#005effff', border: '#005effff', accent: '#B45309', nameEn: 'Hajj & Umrah' },
  19: { bg: '#000000ff', border: '#000000ff', accent: '#64748B', nameEn: 'General Duas' },
  20: { bg: '#005effff', border: '#005effff', accent: '#475569', nameEn: 'Appendix & Virtues' }
};
