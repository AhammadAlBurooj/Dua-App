import fs from 'fs';
import { ASMAUL_HUSNA } from './src/data/asmaulHusna.js';

const outputData = JSON.parse(fs.readFileSync('./src/data/awraad.json', 'utf8'));

function cleanText(text) {
  if (!text) return '';
  return text.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF\u00A0\u2009]/g, '').trim();
}

function normalizeArabic(text) {
  if (!text) return '';
  return cleanText(text)
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

console.log('Comparing Names:');
let matches = 0;
let unmatched = [];

for (const name of ASMAUL_HUSNA) {
  const norm = normalizeArabic(name.arabic);
  const out = outputData.asmaul_husna.find(o => normalizeArabic(o.name_arabic) === norm);
  if (out) {
    matches++;
    console.log(`[${name.id}] ${name.arabic} (${name.transliteration}) -> output #${out.sl_no} (${out.name_arabic}) audio: ${out.audio_url}`);
  } else {
    unmatched.push(name);
  }
}

console.log(`\nMatched: ${matches} / ${ASMAUL_HUSNA.length}`);
console.log(`Unmatched: ${unmatched.length}`);
if (unmatched.length > 0) {
  console.log('Unmatched names:', unmatched);
}

