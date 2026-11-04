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

// Build clean output items
const outputMap = outputData.duas.map(d => ({
  id: d.id,
  audio_url: d.audio_url,
  rawDua: d.dua,
  desc: cleanText(d.desc),
  trans: cleanText(d.trans),
  norm: normalizeArabic(d.dua)
}));

// Manual precision table for 100% exact authenticity
const manualFixes = {
  'daily-1': 96,  // Morning dua (أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلهِ)
  'daily-2': 97,  // Evening dua (أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلهِ)
  'daily-4': 1,   // Waking up (الْحَمْدُ لِلهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا)
  'daily-8': 19,  // Entering home (بِسْمِ اللهِ)
  'daily-9': 17,  // Leaving home (بِسْمِ اللهِ تَوَكَّلْتُ عَلَى اللهِ)
  'daily-10': 484, // Mirror (اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي)
  'prayer-1': 34, // Istiftah 1 (اللَّهُمَّ بَاعِدْ بَيْنِي)
  'prayer-2': 35, // Istiftah 2 (سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ)
  'prayer-3': 40, // Ruku (سُبْحَانَ رَبِّيَ الْعَظِيمِ)
  'prayer-4': 46, // Rising from Ruku (رَبَّنَا وَلَكَ الْحَمْدُ)
  'prayer-5': 48, // Sujood (سُبْحَانَ رَبِّيَ الْأَعْلَى)
  'prayer-6': 55, // Between two sujoods (رَبِّ اغْفِرْ لِي)
  'prayer-7': 59, // Tashahhud (التَّحِيَّاتُ لِلهِ)
  'prayer-8': 61, // Durood Ibrahim (اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ)
  'prayer-9': 63, // Before Tasleem (اللَّهُمَّ إِنِّـي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ)
  'prayer-10': 75, // Post-prayer (اللَّهُمَّ أَنْتَ السَّلاَمُ)
  'forgiveness-1': 100, // Sayyidul Istighfar (اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلٰهَ إِلاَّ أَنْتَ)
  'forgiveness-2': 74, // Astaghfirullah
  'forgiveness-3': 244, // Rabbighfirli wa tub alayya
  'forgiveness-4': 64, // Min azabil qabr
  'forgiveness-5': 65, // Allaahumma inni zalamtu nafsi
  'protection-1': 127, // A'oodhu bikalimatillahittammati min sharri ma khalaq
  'protection-2': 166, // Min ash-shaytan
  'protection-3': 184, // U'eedhuka bikalimatillah (Evil eye)
  'protection-4': 111, // Bismillahilladhi la yadurru
  'protection-5': 147, // Fear / distress (A'oodhu bikalimatillahittammati min ghadabihi)
  'protection-6': 11, // Entering bathroom (Allahumma inni a'oodhu bika minal khubuthi wal khaba'ith)
  'protection-7': 12, // Leaving bathroom (Ghufranaka)
  'health-1': 188, // Illness (Allahumma Rabban-nas adh-hibil ba's)
  'health-2': 187, // Visiting sick (La ba'sa tahoorun)
  'health-3': 434, // Protection from illness (Allahumma inni a'oodhu bika minal barasi...)
  'health-4': 104, // Allahumma 'aafinee fee badanee
  'distress-1': 154, // Distress 1 (Allahumma inni a'oodhu bika minal hammi wal hazan)
  'distress-2': 155, // Distress 2 (La ilaha illa anta subhanaka...)
  'distress-3': 416, // Laziness
  'distress-4': 169, // Debt (Allahummak-finee bi halalika 'an haramik)
  'distress-5': 172, // Hardship (Allahumma la sahla illa ma ja'altahu sahla)
  'distress-6': 348, // Patience (Rabbana afrigh 'alayna sabran)
  'distress-7': 156, // Ya Hayyu Ya Qayyoom bi rahmatika astagheeth
  'food-1': 9, // Before eating (Bismillah)
  'food-2': 226, // After eating (Alhamdulillahilladhi at'amana...)
  'food-3': 223, // Forgot Bismillah (Bismillahi awwalahu wa akhirahu)
  'food-4': 225, // Milk (Allahumma barik lana feehi wa zidna minhu)
  'food-5': 219, // Iftar (Dhahaba-dhama'u wabtallatil 'urooq)
  'travel-1': 260, // Starting journey (Subhanalladhi sakh-khara lana hadha...)
  'travel-2': 258, // Mounting vehicle (Bismillah, Alhamdulillah...)
  'travel-3': 262, // Entering new place
  'travel-4': 261, // Returning from travel (Aa'iboona, taa'iboona...)
  'travel-5': 260, // Safe journey
  'family-1': 369, // Parents (Rabbigh-fir lee wa liwalidayya...)
  'family-2': 353, // Children (Rabbana hab lana min azwajina wa dhurriyyatina...)
  'family-3': 379, // Spouse (Rabbana hab lana min azwajina...)
  'family-4': 107, // Protection of family (Allahumma inni as'aluka al-'afwa wal 'aafiyah...)
  'family-5': 435, // Good character (Allahumma ahsanta khalqi fa hassin khuluqi)
  'quranic-1': 359, // Adam (Rabbana zalamna anfusana...)
  'quranic-2': 368, // Ibrahim (Rabbi-j'alnee muqeemas-salati...)
  'quranic-3': 371, // Musa (Rabbish-rah lee sadree...)
  'quranic-4': 157, // Yunus (La ilaha illa anta subhanak...)
  'quranic-5': 374, // Zakariya (Rabbi hab lee min ladunka...)
  'quranic-6': 287, // Rabbana Aatina fid-dunya hasanatan
  'quranic-7': 351, // Rabbana la tuzigh quloobana
  'ramadan-1': 218, // Crescent moon (Allahumma ahlilhu 'alayna bil yumni wal iman...)
  'ramadan-3': 219, // Iftar (Dhahaba-dhama'u...)
  'ramadan-4': 436, // Laylatul Qadr (Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'annee)
  'knowledge-1': 372, // Rabbi zidnee 'ilma
  'knowledge-2': 419, // Guidance (Allahumma inni as'alukal huda wat-tuqa...)
  'knowledge-3': 88, // Beneficial knowledge (Allahumma inni as'aluka 'ilman nafi'an...)
  'knowledge-4': 435, // Good character
  'knowledge-5': 430 // Firm heart (Ya Muqallibal quloobi thabbit qalbee 'ala deenik)
};

console.log('Generating full verified mapping...');
const finalMap = {};
for (const ex of DUAS) {
  let outputId = manualFixes[ex.id];
  let outItem = null;
  if (outputId) {
    outItem = outputMap.find(o => o.id === outputId);
  } else {
    // try exact norm match
    const normEx = normalizeArabic(ex.arabic);
    outItem = outputMap.find(o => o.norm === normEx);
  }

  if (outItem && outItem.audio_url) {
    finalMap[ex.id] = {
      outputId: outItem.id,
      audioCode: outItem.audio_url,
      audioUrl: `https://crimson-cell-3d4c.mubarakar95.workers.dev/${outItem.audio_url}.mp3`,
      title: ex.titleMl
    };
  } else {
    finalMap[ex.id] = null;
  }
}

const withAudio = Object.entries(finalMap).filter(([k, v]) => v !== null);
console.log(`Final Verified Mapping: ${withAudio.length} of ${DUAS.length} have verified audio!`);
fs.writeFileSync('src/data/finalAudioMap.json', JSON.stringify(finalMap, null, 2));
console.log('Written to src/data/finalAudioMap.json');

