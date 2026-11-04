import fs from 'fs';
import { DUAS } from './src/data/duasData.js';

const audioMap = JSON.parse(fs.readFileSync('src/data/finalAudioMap.json', 'utf8'));

let updatedCount = 0;
const updatedDuas = DUAS.map(dua => {
  const audioInfo = audioMap[dua.id];
  if (audioInfo && audioInfo.audioUrl) {
    updatedCount++;
    return {
      ...dua,
      audioUrl: audioInfo.audioUrl
    };
  } else {
    // If it already had an audioUrl (e.g. from everyayah.com), keep or remove
    const { audioUrl, ...rest } = dua;
    return rest;
  }
});

console.log(`Updated ${updatedCount} duas with Cloudflare worker audio URLs!`);

const content = `/**
 * Dua App Catalog - Comprehensive Authentic Duas Database
 * 
 * Features:
 * - 12 Distinct Islamic Life Categories
 * - 76 Authentic Supplications
 * - Full Arabic Text with Complete Tashkeel & Harakat
 * - Malayalam Transliteration (ഉച്ചാരണം)
 * - Malayalam Meaning & English Translation
 * - Verified Quranic & Hadith References (Sahih al-Bukhari, Sahih Muslim, Quran, Sunan Sahih)
 * - Distinct Authenticity Grading Badges
 * - Studio-recorded Audio Recitations hosted on Cloudflare Worker CDN
 */

export const DUAS = ${JSON.stringify(updatedDuas, null, 2)};

export const DUA_OF_THE_DAY_ID = 'quranic-6';
`;

fs.writeFileSync('src/data/duasData.js', content, 'utf8');
console.log('Successfully written updated src/data/duasData.js!');

