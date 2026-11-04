import fs from 'fs';

const outputData = JSON.parse(fs.readFileSync('./src/data/awraad.json', 'utf8'));

console.log('Searching for മാതാപിതാ (parents)...');
outputData.duas.forEach(d => {
  if (d.trans?.includes('മാതാപിതാ') || d.desc?.includes('മാതാപിതാ')) {
    console.log(`Dua #${d.id}: audio_url="${d.audio_url}", desc="${d.desc}", trans="${d.trans?.slice(0, 50)}"`);
  }
});

console.log('\nSearching for മാസപ്പിറവി (crescent)...');
outputData.duas.forEach(d => {
  if (d.trans?.includes('മാസപ്പിറവി') || d.desc?.includes('മാസപ്പിറവി')) {
    console.log(`Dua #${d.id}: audio_url="${d.audio_url}", desc="${d.desc}"`);
  }
});

console.log('\nSearching for നോമ്പ് തുറ (iftar)...');
outputData.duas.forEach(d => {
  if (d.trans?.includes('നോമ്പ് തുറ') || d.desc?.includes('നോമ്പ് തുറ')) {
    console.log(`Dua #${d.id}: audio_url="${d.audio_url}", desc="${d.desc}", text="${d.dua.slice(0, 50)}"`);
  }
});

