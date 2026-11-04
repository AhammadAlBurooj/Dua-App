import fs from 'fs';

const outputData = JSON.parse(fs.readFileSync('./src/data/awraad.json', 'utf8'));

// English names dictionary for all 99 names
const englishInfo = {
  1: { enTrans: 'Allah', enMeaning: 'The Greatest Name / The One God' },
  2: { enTrans: 'Ar-Rabb', enMeaning: 'The Lord and Cherisher' },
  3: { enTrans: 'Ar-Rahmaan', enMeaning: 'The Most Beneficent / The Compassionate' },
  4: { enTrans: 'Ar-Raheem', enMeaning: 'The Most Merciful' },
  5: { enTrans: 'Al-Malik', enMeaning: 'The Sovereign Lord / The King' },
  6: { enTrans: 'Al-Quddoos', enMeaning: 'The Most Sacred / The Holy' },
  7: { enTrans: 'As-Salaam', enMeaning: 'The Source of Peace and Safety' },
  8: { enTrans: "Al-Mu'min", enMeaning: 'The Granter of Security / The Guardian of Faith' },
  9: { enTrans: 'Al-Muhaymin', enMeaning: 'The Overseer / The Preserver of Safety' },
  10: { enTrans: 'Al-Azeez', enMeaning: 'The All-Mighty / The Invulnerable' },
  11: { enTrans: 'Al-Jabbaar', enMeaning: 'The Compeller / The Restorer' },
  12: { enTrans: 'Al-Mutakabbir', enMeaning: 'The Supreme / The Majestic' },
  13: { enTrans: 'Al-Khaaliq', enMeaning: 'The Creator' },
  14: { enTrans: "Al-Baari'", enMeaning: 'The Evolver / The Maker of Order' },
  15: { enTrans: 'Al-Musawwir', enMeaning: 'The Fashioner of Forms' },
  16: { enTrans: 'Al-Ghaffaar', enMeaning: 'The Perpetual Forgiver' },
  17: { enTrans: 'Al-Qahhaar', enMeaning: 'The All-Subduer / The Absolute Ruler' },
  18: { enTrans: 'Al-Wahhaab', enMeaning: 'The Supreme Bestower / The Giver of Gifts' },
  19: { enTrans: 'Ar-Razzaaq', enMeaning: 'The Total Provider / The Sustainer' },
  20: { enTrans: 'As-Sitteer', enMeaning: 'The Concealer of Sins and Faults' },
  21: { enTrans: 'Al-Fattaah', enMeaning: 'The Supreme Opener / The Granter of Victory' },
  22: { enTrans: "Al-'Aleem", enMeaning: 'The All-Knowing / The Omniscient' },
  23: { enTrans: 'Al-Qaabidh', enMeaning: 'The Withholder / The Restrainer' },
  24: { enTrans: 'Al-Baasit', enMeaning: 'The Expander / The Extender' },
  25: { enTrans: 'Al-Khaafidh', enMeaning: 'The Abaser / The Reducer' },
  26: { enTrans: "Ar-Raafi'", enMeaning: 'The Exalter / The Elevator' },
  27: { enTrans: "Al-Mu'izz", enMeaning: 'The Bestower of Honor' },
  28: { enTrans: 'Al-Mudhill', enMeaning: 'The Dishonorer / The Humiliator' },
  29: { enTrans: "As-Samee'", enMeaning: 'The All-Hearing' },
  30: { enTrans: 'Al-Baseer', enMeaning: 'The All-Seeing' },
  31: { enTrans: 'Al-Hakam', enMeaning: 'The Impartial Judge' },
  32: { enTrans: "Al-'Adl", enMeaning: 'The Utterly Just' },
  33: { enTrans: 'Al-Lateef', enMeaning: 'The Subtle / The Most Gentle' },
  34: { enTrans: 'Al-Khabeer', enMeaning: 'The All-Aware / The Acquainted' },
  35: { enTrans: 'Al-Haleem', enMeaning: 'The Most Forbearing / The Clement' },
  36: { enTrans: "Al-'Azeem", enMeaning: 'The Magnificent / The Infinite' },
  37: { enTrans: 'Al-Ghafoor', enMeaning: 'The All-Forgiving / The Forgiving' },
  38: { enTrans: 'Ash-Shakoor', enMeaning: 'The Most Appreciative / The Grateful' },
  39: { enTrans: "Al-'Aliyy", enMeaning: 'The Most High / The Exalted' },
  40: { enTrans: 'Al-Kabeer', enMeaning: 'The Most Great / The Grand' },
  41: { enTrans: 'Al-Hafeez', enMeaning: 'The Preserver / The Guardian' },
  42: { enTrans: 'Al-Muqeet', enMeaning: 'The Sustainer / The Nourisher' },
  43: { enTrans: 'Al-Haseeb', enMeaning: 'The Reckoner / The Accounter' },
  44: { enTrans: 'Al-Jaleel', enMeaning: 'The Majestic / The Sublime' },
  45: { enTrans: 'Al-Kareem', enMeaning: 'The Most Generous / The Bountiful' },
  46: { enTrans: 'Ar-Raqeeb', enMeaning: 'The Watchful / The Observer' },
  47: { enTrans: 'Al-Mujeeb', enMeaning: 'The Responsive / The Answerer of Prayers' },
  48: { enTrans: "Al-Waasi'", enMeaning: 'The Vast / The All-Encompassing' },
  49: { enTrans: 'Al-Hakeem', enMeaning: 'The All-Wise' },
  50: { enTrans: 'Al-Wadood', enMeaning: 'The Most Loving' },
  51: { enTrans: 'Al-Majeed', enMeaning: 'The Most Glorious' },
  52: { enTrans: "Al-Baa'ith", enMeaning: 'The Resurrecter / The Awakener' },
  53: { enTrans: 'Ash-Shaheed', enMeaning: 'The All-Witnessing' },
  54: { enTrans: 'Al-Haqq', enMeaning: 'The Absolute Truth' },
  55: { enTrans: 'Al-Wakeel', enMeaning: 'The Trustee / The Dependable' },
  56: { enTrans: 'Al-Qawiyy', enMeaning: 'The Most Strong / The Strong' },
  57: { enTrans: 'Al-Mateen', enMeaning: 'The Firm / The Steadfast' },
  58: { enTrans: 'Al-Waliyy', enMeaning: 'The Protecting Friend / The Helper' },
  59: { enTrans: 'Al-Hameed', enMeaning: 'The All-Praiseworthy' },
  60: { enTrans: "Al-Mubdi'", enMeaning: 'The Originator / The Initiator' },
  61: { enTrans: "Al-Mu'eed", enMeaning: 'The Restorer / The Recreator' },
  62: { enTrans: 'Al-Muhyi', enMeaning: 'The Giver of Life' },
  63: { enTrans: 'Al-Mumeet', enMeaning: 'The Creator of Death' },
  64: { enTrans: 'Al-Hayy', enMeaning: 'The Ever-Living' },
  65: { enTrans: 'Al-Qayyoom', enMeaning: 'The Self-Subsisting Sustainer' },
  66: { enTrans: 'Al-Waajid', enMeaning: 'The Finder / The Unfailing' },
  67: { enTrans: 'Al-Maajid', enMeaning: 'The Noble / The Magnificent' },
  68: { enTrans: 'Al-Waahid', enMeaning: 'The One / The Unique' },
  69: { enTrans: 'As-Samad', enMeaning: 'The Eternal / The Independent' },
  70: { enTrans: 'Al-Qaadir', enMeaning: 'The All-Capable / The Omnipotent' },
  71: { enTrans: 'Al-Muqtadir', enMeaning: 'The Determiner / The Dominant' },
  72: { enTrans: 'Al-Muqaddim', enMeaning: 'The Expediter / The Promoter' },
  73: { enTrans: "Al-Mu'akhkhir", enMeaning: 'The Delayer / The Postponer' },
  74: { enTrans: 'Al-Awwal', enMeaning: 'The First (Without Beginning)' },
  75: { enTrans: 'Al-Aakhir', enMeaning: 'The Last (Without End)' },
  76: { enTrans: 'Az-Zaahir', enMeaning: 'The Manifest / The Evident' },
  77: { enTrans: 'Al-Baatin', enMeaning: 'The Hidden / The Unseen' },
  78: { enTrans: "Al-Muta'aali", enMeaning: 'The Most Exalted / The Supreme' },
  79: { enTrans: 'Al-Barr', enMeaning: 'The Source of Goodness / The Benign' },
  80: { enTrans: 'At-Tawwaab', enMeaning: 'The Acceptor of Repentance' },
  81: { enTrans: 'Al-Muntaqim', enMeaning: 'The Avenger / The Just Requiter' },
  82: { enTrans: "Al-'Afuww", enMeaning: 'The Pardoner / The Eraser of Sins' },
  83: { enTrans: "Ar-Ra'oof", enMeaning: 'The Most Kind / The Compassionate' },
  84: { enTrans: 'Maalik-ul-Mulk', enMeaning: 'Owner of All Sovereignty' },
  85: { enTrans: 'Dhul-Jalaali-wal-Ikraam', enMeaning: 'Lord of Majesty and Generosity' },
  86: { enTrans: 'Al-Muqsit', enMeaning: 'The Equitable / The Fair Requiter' },
  87: { enTrans: "Al-Jaami'", enMeaning: 'The Gatherer / The Unifier' },
  88: { enTrans: 'Al-Ghaniyy', enMeaning: 'The Self-Sufficient / The Wealthy' },
  89: { enTrans: 'Al-Mughni', enMeaning: 'The Enricher / The Bestower of Wealth' },
  90: { enTrans: 'An-Noor', enMeaning: 'The Light / The Illuminator' },
  91: { enTrans: 'Al-Haadi', enMeaning: 'The Guide to the Right Path' },
  92: { enTrans: "Al-Badee'", enMeaning: 'The Incomparable Originator' },
  93: { enTrans: 'Al-Baaqi', enMeaning: 'The Everlasting' },
  94: { enTrans: 'Al-Waarith', enMeaning: 'The Ultimate Inheritor of All' },
  95: { enTrans: 'As-Saboor', enMeaning: 'The Patient / The Forbearing' },
  96: { enTrans: 'Al-Jameel', enMeaning: 'The Beautiful (in Essence & Attributes)' },
  97: { enTrans: 'Al-Jawwaad', enMeaning: 'The Magnanimous / The Boundlessly Generous' },
  98: { enTrans: 'Ar-Rafeeq', enMeaning: 'The Gentle / The Companion in Mercy' },
  99: { enTrans: 'An-Naseer', enMeaning: 'The Ultimate Helper and Protector' }
};

const updatedAsmaulHusna = outputData.asmaul_husna.map(item => {
  const en = englishInfo[item.sl_no] || { enTrans: item.name_arabic, enMeaning: item.name_trans };
  return {
    id: item.sl_no,
    arabic: item.name_arabic,
    transliteration: `${item.name_transli} (${en.enTrans})`,
    transliterationMl: item.name_transli,
    transliterationEn: en.enTrans,
    meaningMl: item.name_trans,
    meaningEn: en.enMeaning,
    audioUrl: `https://crimson-cell-3d4c.mubarakar95.workers.dev/${item.audio_url}.mp3`
  };
});

console.log('Generated names count:', updatedAsmaulHusna.length);
console.log('Sample Name 1:', updatedAsmaulHusna[0]);
console.log('Sample Name 20:', updatedAsmaulHusna[19]);
console.log('Sample Name 99:', updatedAsmaulHusna[98]);

const fileContent = `/**
 * 99 Names of Allah (Asmaul Husna / അസ്മാഉൽ ഹുസ്നാ)
 * Complete authentic names from Quran & Sunnah with Arabic, Transliteration,
 * Malayalam meaning, English translation, and studio-recorded Cloudflare audio recitation.
 */

export const ASMAUL_HUSNA = ${JSON.stringify(updatedAsmaulHusna, null, 2)};
`;

fs.writeFileSync('src/data/asmaulHusna.js', fileContent, 'utf8');
console.log('Successfully wrote src/data/asmaulHusna.js!');

