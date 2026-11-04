import fs from 'fs';

const outputData = JSON.parse(fs.readFileSync('./src/data/awraad.json', 'utf8'));

const searches = [
  { label: 'daily-10 (mirror)', word: 'حسنت' },
  { label: 'protection-3 (evil eye)', word: 'بكلمات' },
  { label: 'health-1 (illness)', word: 'اذهب الباس' },
  { label: 'food-5 (iftar)', word: 'صمت' },
  { label: 'family-1 (parents)', word: 'ارحمهما' },
  { label: 'family-5 (character)', word: 'احسن الاخلاق' },
  { label: 'ramadan-1 (crescent moon)', word: 'اهله' },
  { label: 'ramadan-2 (suhoor)', word: 'السحور' },
  { label: 'ramadan-3 (iftar)', word: 'الظما' }
];

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

for (const s of searches) {
  console.log(`\n=== Searching for ${s.label}: "${s.word}" ===`);
  const results = outputData.duas.filter(d => {
    const norm = normalizeArabic(d.dua);
    return norm.includes(s.word);
  });
  if (results.length === 0) {
    console.log('  No results found in output.json');
  } else {
    results.forEach(r => {
      console.log(`  Found in Dua #${r.id}: audio_url="${r.audio_url}", desc="${r.desc?.slice(0, 30)}", text="${r.dua.slice(0, 60)}"`);
    });
  }
}

