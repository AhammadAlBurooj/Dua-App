import fs from 'fs';
import { DUAS } from './src/data/duasData.js';
import { ASMAUL_HUSNA } from './src/data/asmaulHusna.js';

const outputData = JSON.parse(fs.readFileSync('C:/Users/mym/Downloads/output.json', 'utf8'));

console.log('Loaded existing duas:', DUAS.length);
console.log('Loaded output duas:', outputData.duas.length);

// Arabic normalization helper
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\u0640/g, '')
    .replace(/[^\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const outputMap = outputData.duas.map(outDua => ({
  id: outDua.id,
  audio_url: outDua.audio_url,
  rawDua: outDua.dua,
  trans: outDua.trans,
  normDua: normalizeArabic(outDua.dua),
  firstWords: normalizeArabic(outDua.dua).split(' ').slice(0, 5).join(' ')
}));

let matchedCount = 0;
let unmatched = [];
const matches = [];

for (const exDua of DUAS) {
  const normEx = normalizeArabic(exDua.arabic);
  const firstWordsEx = normEx.split(' ').slice(0, 5).join(' ');

  // 1. Exact normalized match
  let match = outputMap.find(o => o.normDua === normEx);

  // 2. Contains match
  if (!match && normEx.length > 15) {
    match = outputMap.find(o => o.normDua.includes(normEx) || normEx.includes(o.normDua));
  }

  // 3. First 5 words match
  if (!match && firstWordsEx.length > 10) {
    match = outputMap.find(o => o.normDua.startsWith(firstWordsEx) || normEx.startsWith(o.firstWords));
  }

  // 4. Match by first 3 words
  if (!match) {
    const first3Words = normEx.split(' ').slice(0, 3).join(' ');
    if (first3Words.length > 8) {
      match = outputMap.find(o => o.normDua.startsWith(first3Words));
    }
  }

  if (match) {
    matchedCount++;
    matches.push({
      exId: exDua.id,
      outId: match.id,
      audio_url: match.audio_url,
      titleMl: exDua.titleMl
    });
  } else {
    unmatched.push({
      id: exDua.id,
      titleMl: exDua.titleMl,
      arabic: exDua.arabic.slice(0, 60),
      norm: normEx.slice(0, 60)
    });
  }
}

console.log('Total matched:', matchedCount, 'out of', DUAS.length);
console.log('Unmatched count:', unmatched.length);
if (unmatched.length > 0) {
  console.log('Unmatched items:');
  unmatched.forEach(u => console.log(`- [${u.id}] ${u.titleMl} | ${u.norm}`));
}

// Check Asmaul Husna matching
console.log('\n--- Checking Asmaul Husna ---');
let asmaMatched = 0;
let asmaUnmatched = [];

for (const name of ASMAUL_HUSNA) {
  const normName = normalizeArabic(name.arabic);
  let outName = outputData.asmaul_husna.find(o => normalizeArabic(o.name_arabic) === normName);
  if (!outName) {
    // Try matching by id / sl_no
    outName = outputData.asmaul_husna.find(o => o.sl_no === name.id);
  }
  if (outName) {
    asmaMatched++;
  } else {
    asmaUnmatched.push(name);
  }
}
console.log('Asmaul Husna matched:', asmaMatched, 'out of', ASMAUL_HUSNA.length);

