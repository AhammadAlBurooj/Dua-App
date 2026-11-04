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
