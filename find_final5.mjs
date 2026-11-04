import fs from 'fs';

const outputData = JSON.parse(fs.readFileSync('C:/Users/mym/Downloads/output.json', 'utf8'));

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

console.log('--- 1. prayer-6 (two sujoods: رب اغفر لي) ---');
outputData.duas.forEach(d => {
  const norm = normalizeArabic(d.dua);
  if (norm.includes('رب اغفر لي رب اغفر لي') || cleanText(d.desc).includes('സുജൂദുകൾക്കിടയിൽ') || (norm.startsWith('رب اغفر لي') && norm.length < 50)) {
    console.log(`Dua #${d.id} audio: "${d.audio_url}" | text: ${d.dua}`);
  }
});

console.log('\n--- 2. forgiveness-3 (رب اغفر لي وتب علي) ---');
outputData.duas.forEach(d => {
  const norm = normalizeArabic(d.dua);
  if (norm.includes('وتب علي') || norm.includes('التواب الرحيم')) {
    console.log(`Dua #${d.id} audio: "${d.audio_url}" | text: ${d.dua}`);
  }
});

console.log('\n--- 3. health-5 (نفسا بك مطمئنة) ---');
outputData.duas.forEach(d => {
  const norm = normalizeArabic(d.dua);
  if (norm.includes('مطمئنه') || norm.includes('مطمئنة')) {
    console.log(`Dua #${d.id} audio: "${d.audio_url}" | text: ${d.dua}`);
  }
});

console.log('\n--- 4. quranic-3 (Musa: رب اشرح لي صدري) ---');
outputData.duas.forEach(d => {
  const norm = normalizeArabic(d.dua);
  if (norm.includes('اشرح لي صدري')) {
    console.log(`Dua #${d.id} audio: "${d.audio_url}" | text: ${d.dua}`);
  }
});

console.log('\n--- 5. ramadan-5 (برحمتك التي وسعت كل شيء) ---');
outputData.duas.forEach(d => {
  const norm = normalizeArabic(d.dua);
  if (norm.includes('وسعت كل شي')) {
    console.log(`Dua #${d.id} audio: "${d.audio_url}" | text: ${d.dua}`);
  }
});

