/**
 * Manglish (Malayalam written in Latin script) & Malayalam Text Search Utilities
 * Provides:
 * - Malayalam text normalization (stripping ZWNJ \u200C, ZWJ \u200D, zero-width spaces, diacritics)
 * - Extensive Manglish keyword-to-Malayalam mapping for all Main Categories (Awraad) and Duas
 * - Phonetic Manglish-to-Malayalam transliteration generator
 * - Multi-variant search query builder
 */

export function cleanMalayalamText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip ZWNJ, ZWJ, zero-width space
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // strip Arabic tashkeel for Arabic matching
    .toLowerCase()
    .trim();
}

/**
 * Common Manglish keywords mapped to Malayalam words and semantic category terms.
 */
export const MANGLISH_KEYWORDS_MAP = {
  // Morning & Evening (പ്രഭാതവും പ്രദോഷവും)
  'ravile': ['രാവിലെ', 'പ്രഭാതം', 'പ്രഭാതവും പ്രദോഷവും', 'morning'],
  'ravila': ['രാവിലെ', 'പ്രഭാതം', 'പ്രഭാതവും പ്രദോഷവും'],
  'ravil': ['രാവിലെ', 'പ്രഭാതം'],
  'kalathu': ['രാവിലെ', 'പ്രഭാതം'],
  'prabhatham': ['പ്രഭാതം', 'പ്രഭാതവും പ്രദോഷവും', 'രാവിലെ'],
  'prabhatha': ['പ്രഭാതം', 'പ്രഭാതവും പ്രദോഷവും'],
  'vaikuneram': ['വൈകുന്നേരം', 'പ്രദോഷം'],
  'vaikittu': ['വൈകുന്നേരം', 'പ്രദോഷം'],
  'pradhosham': ['പ്രദോഷം', 'വൈകുന്നേരം'],
  'pradhosha': ['പ്രദോഷം', 'വൈകുന്നേരം'],

  // Sleep & Waking (ഉറക്കവും ഉണരലും)
  'urakkam': ['ഉറക്കം', 'ഉറങ്ങാൻ', 'ഉറക്കവും ഉണരലും', 'ഉണരുമ്പോൾ', 'sleep'],
  'urangumpol': ['ഉറങ്ങാൻ', 'ഉറക്കം'],
  'urangaan': ['ഉറങ്ങാൻ', 'ഉറക്കം'],
  'unarumbol': ['ഉണരുമ്പോൾ', 'ഉറക്കിൽ നിന്ന് ഉണരുമ്പോൾ'],
  'swapnam': ['സ്വപ്നം', 'പേടിസ്വപ്നം'],
  'pedichal': ['പേടിച്ചാൽ', 'പേടി'],

  // Travel (യാത്ര / സഫർ)
  'safar': ['യാത്ര', 'സഫർ', 'വാഹനം', 'travel', 'journey'],
  'safari': ['യാത്ര', 'സഫർ'],
  'yathra': ['യാത്ര', 'വാഹനം', 'സഫർ'],
  'yathrakaran': ['യാത്രക്കാരൻ', 'യാത്ര'],
  'vahanam': ['വാഹനം', 'വാഹനത്തിൽ'],
  'vahanathil': ['വാഹനത്തിൽ', 'വാഹനം'],
  'irangumbol': ['ഇറങ്ങുമ്പോൾ'],

  // Prayer & Salah (നമസ്കാരം)
  'niskaram': ['നമസ്കാരം', 'നിസ്കാരം', 'വുദു', 'ബാങ്ക്', 'സലാം', 'prayer', 'salah'],
  'namaskaram': ['നമസ്കാരം', 'നിസ്കാരം', 'വുദു', 'prayer'],
  'niskkaram': ['നമസ്കാരം', 'നിസ്കാരം'],
  'salah': ['നമസ്കാരം', 'സ്വലാത്ത്', 'നിസ്കാരം'],
  'salat': ['നമസ്കാരം', 'നിസ്കാരം'],
  'vudoo': ['വുദു', 'വുദൂഅ്'],
  'wudu': ['വുദു', 'വുദൂഅ്'],
  'wudhoo': ['വുദു', 'വുദൂഅ്'],
  'baank': ['ബാങ്ക്', 'അദാൻ'],
  'adhan': ['ബാങ്ക്', 'അദാൻ'],
  'athan': ['ബാങ്ക്', 'അദാൻ'],
  'subhi': ['സുബ്ഹ്', 'പ്രഭാതം'],
  'subh': ['സുബ്ഹ്'],
  'luhar': ['ദുഹ്ർ', 'ളുഹ്ർ'],
  'dhuhr': ['ളുഹ്ർ', 'ദുഹ്ർ'],
  'asar': ['അസ്വർ', 'അസർ'],
  'maghrib': ['മഗ്‌രിബ്'],
  'isha': ['ഇശാഅ്', 'ഇശാ'],
  'thahajjad': ['തഹജ്ജുദ്'],
  'witir': ['വിത്ർ'],

  // Mosque (പള്ളി)
  'palli': ['പള്ളി', 'മസ്ജിദ്', 'mosque'],
  'palliyil': ['പള്ളിയിൽ', 'പള്ളി'],
  'masjid': ['മസ്ജിദ്', 'പള്ളി', 'mosque'],

  // Fasting & Food (ഭക്ഷണവും നോമ്പും)
  'nonbu': ['നോമ്പ്', 'വ്രതം', 'ഇഫ്താർ', 'സഹർ', 'fasting'],
  'nombu': ['നോമ്പ്', 'വ്രതം', 'ഇഫ്താർ', 'fasting'],
  'roza': ['നോമ്പ്', 'വ്രതം'],
  'ifthar': ['ഇഫ്താർ', 'നോമ്പ് തുറ'],
  'sawoom': ['നോമ്പ്'],
  'bhakshanam': ['ഭക്ഷണം', 'പാനീയം', 'ഭക്ഷണത്തിന്'],
  'thinnuka': ['ഭക്ഷണം'],
  'kudikkuka': ['പാനീയം', 'വെള്ളം'],
  'vellam': ['വെള്ളം', 'പാനീയം'],
  'virunnu': ['വിരുന്ന്', 'സൽക്കാരം'],

  // Illness & Death (രോഗവും മരണവും)
  'rogam': ['രോഗം', 'ശിഫ', 'രോഗി', 'സുഖം'],
  'rogi': ['രോഗി', 'രോഗം'],
  'shifa': ['ശിഫ', 'രോഗം'],
  'maranam': ['മരണം', 'ജനാസ', 'ഖബർ'],
  'mayyith': ['മയ്യിത്ത്', 'ജനാസ', 'മരണം'],
  'janaza': ['ജനാസ', 'മരണം'],
  'khabar': ['ഖബർ', 'മരണം'],

  // Repentance & Distress (പശ്ചാത്താപവും വിഷമതകളും)
  'thowbah': ['പശ്ചാത്താപം', 'പാപമോചനം', 'തൗബ', 'ഇസ്തിഗ്ഫാർ'],
  'tawbah': ['പശ്ചാത്താപം', 'പാപമോചനം', 'തൗബ'],
  'istighfar': ['ഇസ്തിഗ്ഫാർ', 'പാപമോചനം'],
  'sayyidul istighfar': ['സയ്യിദുൽ ഇസ്തിഗ്ഫാർ'],
  'karb': ['വിഷമം', 'ദുഃഖം', 'കടം', 'പ്രയാസം'],
  'vishamathakal': ['വിഷമതകൾ', 'വിഷമം', 'ദുഃഖം'],
  'vishamangal': ['വിഷമം', 'ദുഃഖം'],
  'dukkham': ['ദുഃഖം', 'വിഷമം'],
  'kadam': ['കടം', 'കടം വീട്ടാൻ'],
  'prayasam': ['പ്രയാസം', 'വിഷമം'],

  // Protection from Shaytan & Enemies (പിശാചും ശത്രുവും)
  'shaythan': ['പിശാച്', 'ശൈത്വാൻ'],
  'shaitan': ['പിശാച്', 'ശൈത്വാൻ'],
  'pisasu': ['പിശാച്'],
  'shathru': ['ശത്രു', 'കാവൽ', 'ഭയം'],
  'kaval': ['കാവൽ', 'സംരക്ഷണം'],
  'raksha': ['രക്ഷ', 'കാവൽ'],
  'bhayam': ['ഭയം', 'പേടി'],
  'bhayapettaal': ['ഭയപ്പെട്ടാൽ', 'ഭയം'],
  'dhesyam': ['ദേഷ്യം', 'കോപം'],
  'kopam': ['കോപം', 'ദേഷ്യം'],

  // Weather & Rain (മഴ, കാറ്റ്)
  'mazha': ['മഴ', 'കാറ്റ്', 'ഇടിമിന്നൽ', 'rain'],
  'kaattu': ['കാറ്റ്', 'മഴ'],
  'idiminnal': ['ഇടിമിന്നൽ', 'ഇടി'],

  // Marriage & Family (വിവാഹവും കുടുംബവും)
  'nikah': ['വിവാഹം', 'കുടുംബം', 'മക്കൾ'],
  'kalyanam': ['വിവാഹം'],
  'vivaham': ['വിവാഹം'],
  'kudumbam': ['കുടുംബം', 'മക്കൾ'],
  'makkal': ['മക്കൾ', 'കുട്ടികൾ'],
  'prasavam': ['പ്രസവം', 'ഗർഭം'],

  // Hajj & Umrah (ഹജ്ജ്, ഉംറ)
  'hajj': ['ഹജ്ജ്', 'ഉംറ', 'ഇഹ്റാം', 'ത്വവാഫ്'],
  'umrah': ['ഉംറ', 'ഹജ്ജ്'],
  'ihram': ['ഇഹ്റാം'],
  'thawaf': ['ത്വവാഫ്'],

  // Quran & General (ഖുർആൻ, ദിക്ർ)
  'quran': ['ഖുർആൻ', 'ഖുർആനിലെ'],
  'khuran': ['ഖുർആൻ'],
  'ayathul kursi': ['ആയത്തുൽ കുർസി', 'കുർസി'],
  'kursi': ['കുർസി', 'ആയത്തുൽ കുർസി'],
  'fathiha': ['ഫാത്തിഹ'],
  'yaseen': ['യാസീൻ'],
  'kahf': ['കഹ്ഫ്'],
  'mulk': ['മുൽക്'],
  'veedu': ['വീട്', 'വീട്ടിൽ'],
  'veettil': ['വീട്ടിൽ', 'വീട്'],
  'toilet': ['ശൗചാലയം', 'ശുചിമുറി'],
  'shouchalayam': ['ശൗചാലയം', 'ശുചിമുറി'],
  'kudam': ['ശൗചാലയം'],
  'kakkoos': ['ശൗചാലയം'],
  'vastram': ['വസ്ത്രം', 'വസ്ത്രം ധരിക്കുമ്പോൾ'],
  'dress': ['വസ്ത്രം'],
  'kannadi': ['കണ്ണാടി'],
  'mirror': ['കണ്ണാടി'],
  'sneham': ['സ്നേഹം', 'സൗഹൃദം'],
  'shukr': ['സ്തുതി', 'നന്ദി', 'ശുക്ർ', 'ഹംദ്'],
  'hamd': ['ഹംദ്', 'സ്തുതി'],
  'sthudi': ['സ്തുതി', 'നന്ദി'],
  'iman': ['ഈമാൻ', 'വിശ്വാസം'],
  'thowheed': ['തൗഹീദ്'],
  'swalath': ['സ്വലാത്ത്', 'സ്വലാത്തുകൾ'],
  'dikr': ['ദിക്ർ', 'ദിക്റുകൾ'],
  'dhikr': ['ദിക്ർ', 'ദിക്റുകൾ'],
  'dua': ['ദുആ', 'പ്രാർത്ഥന']
};

/**
 * Phonetic transliteration table for common Manglish syllables
 */
const PHONETIC_MAP = [
  ['nj', 'ഞ'], ['ng', 'ങ'], ['zh', 'ഴ'], ['th', 'ത'], ['dh', 'ധ'],
  ['kh', 'ഖ'], ['gh', 'ഘ'], ['ch', 'ച'], ['jh', 'ഝ'], ['sh', 'ശ'],
  ['ph', 'ഫ'], ['bh', 'ഭ'],
  ['aa', 'ആ'], ['ee', 'ഈ'], ['oo', 'ഊ'], ['ai', 'ഐ'], ['ou', 'ഔ'],
  ['k', 'ക'], ['g', 'ഗ'], ['c', 'ച'], ['j', 'ജ'], ['t', 'ത'],
  ['d', 'ദ'], ['n', 'ന'], ['p', 'പ'], ['f', 'ഫ'], ['b', 'ബ'],
  ['m', 'മ'], ['y', 'യ'], ['r', 'ര'], ['l', 'ല'], ['v', 'വ'],
  ['w', 'വ'], ['s', 'സ'], ['h', 'ഹ']
];

/**
 * Approximate phonetic transliteration of a Manglish word into Malayalam characters
 */
export function phoneticManglishToMalayalam(word) {
  if (!word || typeof word !== 'string') return '';
  let str = word.toLowerCase().trim();
  let result = str;
  for (const [latin, ml] of PHONETIC_MAP) {
    result = result.split(latin).join(ml);
  }
  return cleanMalayalamText(result);
}

/**
 * Get all search variants (Malayalam, Manglish, cleaned) for a given query string
 */
export function getSearchVariants(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return [];
  const q = rawQuery.toLowerCase().trim();
  const cleanedQ = cleanMalayalamText(q);

  const variants = new Set();
  if (q) variants.add(q);
  if (cleanedQ) variants.add(cleanedQ);

  // Match whole query or individual words in MANGLISH_KEYWORDS_MAP
  const words = q.split(/\s+/).filter(Boolean);
  
  // 1. Direct query matching in dictionary
  for (const [key, mlList] of Object.entries(MANGLISH_KEYWORDS_MAP)) {
    if (q === key || q.includes(key) || key.includes(q)) {
      mlList.forEach(item => {
        variants.add(item.toLowerCase());
        variants.add(cleanMalayalamText(item));
      });
    }
  }

  // 2. Individual words matching in dictionary
  for (const w of words) {
    if (MANGLISH_KEYWORDS_MAP[w]) {
      MANGLISH_KEYWORDS_MAP[w].forEach(item => {
        variants.add(item.toLowerCase());
        variants.add(cleanMalayalamText(item));
      });
    }
  }

  // 3. Phonetic candidate (if length >= 3)
  if (q.length >= 3 && /^[a-zA-Z\s]+$/.test(q)) {
    const phoneticCandidate = phoneticManglishToMalayalam(q);
    if (phoneticCandidate && phoneticCandidate.length >= 2) {
      variants.add(phoneticCandidate);
    }
  }

  return Array.from(variants).filter(Boolean);
}

