import fs from 'fs';
import { DUAS } from './src/data/duasData.js';

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

const outputMap = outputData.duas
  .filter(d => cleanText(d.dua).length > 0)
  .map(outDua => {
    const norm = normalizeArabic(outDua.dua);
    const words = new Set(norm.split(' '));
    return {
      id: outDua.id,
      audio_url: outDua.audio_url,
      rawDua: outDua.dua,
      desc: cleanText(outDua.desc),
      trans: cleanText(outDua.trans),
      normDua: norm,
      words: words
    };
  });

function calculateSimilarity(normA, normB, wordsA, wordsB) {
  if (normA === normB) return 1.0;
  // Word intersection over union (Jaccard)
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = wordsA.size + wordsB.size - intersection;
  const wordSim = union > 0 ? intersection / union : 0;

  // Prefix match bonus
  let prefixBonus = 0;
  const minLen = Math.min(normA.length, normB.length);
  if (minLen > 15) {
    if (normA.startsWith(normB.slice(0, 25)) || normB.startsWith(normA.slice(0, 25))) {
      prefixBonus = 0.3;
    }
  }

  return wordSim + prefixBonus;
}

const bestMatches = [];

for (const exDua of DUAS) {
  const normEx = normalizeArabic(exDua.arabic);
  const wordsEx = new Set(normEx.split(' '));

  let best = null;
  let bestScore = 0;

  for (const out of outputMap) {
    const score = calculateSimilarity(normEx, out.normDua, wordsEx, out.words);
    if (score > bestScore) {
      bestScore = score;
      best = out;
    }
  }

  console.log(`[${exDua.id}] ${exDua.titleMl.slice(0, 22)} -> best #${best?.id} (score: ${bestScore.toFixed(2)}, audio: "${best?.audio_url}")`);
  bestMatches.push({ exDua, best, bestScore });
}

