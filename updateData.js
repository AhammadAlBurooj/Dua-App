import fs from 'fs';

let content = fs.readFileSync('src/data/duasData.js', 'utf8');

// Remove all opendua references
content = content.replace(/[ \t]*audioUrl:\s*'https:\/\/audio\.opendua\.org\/[^']+',?\r?\n/g, '');
content = content.replace(/[ \t]*reciter:\s*'Muhammad Jumah[^']+',?\r?\n/g, '');

// Clean sleep-3 Arabic text
content = content.replace(
  "arabic: 'سُبْحَانَ اللَّهِ (33) ، الْحَمْدُ لِلَّهِ (33) ، اللَّهُ أَكْبَرُ (34)'",
  "arabic: 'سُبْحَانَ اللَّهِ ، الْحَمْدُ لِلَّهِ ، اللَّهُ أَكْبَرُ'"
);

// Remove everyayah audio URLs that had extra/mismatched Quranic intro words
content = content.replace(/[ \t]*audioUrl:\s*'https:\/\/everyayah\.com\/data\/Alafasy_128kbps\/(017024|025074|003038|014040|007023|002201)\.mp3',?\r?\n/g, '');

// Remove reciter lines for all except morning-6
const lines = content.split(/\r?\n/);
let inMorning6 = false;
const newLines = [];

for (let line of lines) {
  if (line.includes("id: 'morning-6'")) {
    inMorning6 = true;
  } else if (inMorning6 && line.includes("id: '")) {
    inMorning6 = false;
  }

  if (line.includes("reciter: 'മിശാരി റാശിദ് അൽ-അഫാസി") && !inMorning6) {
    continue;
  }
  newLines.push(line);
}

content = newLines.join('\n');

// Ensure morning-6 has Mishary Alafasy audioUrl
if (!content.includes("002255.mp3")) {
  content = content.replace(
    /(id:\s*'morning-6'[\s\S]*?recommendedCount:\s*1,)/,
    `$1\n    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3',\n    reciter: 'മിശാരി റാശിദ് അൽ-അഫാസി (Mishary Alafasy)',`
  );
}

fs.writeFileSync('src/data/duasData.js', content, 'utf8');
console.log('duasData.js successfully transformed!');

