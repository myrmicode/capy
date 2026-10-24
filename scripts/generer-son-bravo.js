// Génère assets/sons/bravo.wav : deux notes douces (mi puis la), façon carillon.
// Lancer avec : node scripts/generer-son-bravo.js
const fs = require('fs');
const path = require('path');

const FREQUENCE = 22050;
const DUREE = 0.75;
const VOLUME = 0.22;
const notes = [
  { hz: 659.25, debut: 0 },
  { hz: 880.0, debut: 0.12 },
];

const n = Math.round(FREQUENCE * DUREE);
const donnees = Buffer.alloc(n * 2);
for (let i = 0; i < n; i++) {
  const t = i / FREQUENCE;
  let v = 0;
  for (const { hz, debut } of notes) {
    if (t < debut) continue;
    const u = t - debut;
    const attaque = Math.min(1, u / 0.01);
    const decroissance = Math.exp(-u * 5.5);
    // Fondamentale + une harmonique légère pour un timbre de clochette.
    v += attaque * decroissance * (Math.sin(2 * Math.PI * hz * u) + 0.25 * Math.sin(2 * Math.PI * hz * 2 * u));
  }
  const fondu = Math.min(1, (DUREE - t) / 0.05);
  donnees.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * VOLUME * fondu)) * 32767), i * 2);
}

const entete = Buffer.alloc(44);
entete.write('RIFF', 0);
entete.writeUInt32LE(36 + donnees.length, 4);
entete.write('WAVE', 8);
entete.write('fmt ', 12);
entete.writeUInt32LE(16, 16);
entete.writeUInt16LE(1, 20);
entete.writeUInt16LE(1, 22);
entete.writeUInt32LE(FREQUENCE, 24);
entete.writeUInt32LE(FREQUENCE * 2, 28);
entete.writeUInt16LE(2, 32);
entete.writeUInt16LE(16, 34);
entete.write('data', 36);
entete.writeUInt32LE(donnees.length, 40);

const sortie = path.join(__dirname, '..', 'assets', 'sons', 'bravo.wav');
fs.writeFileSync(sortie, Buffer.concat([entete, donnees]));
console.log(`Écrit : ${sortie}`);
