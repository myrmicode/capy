// Génère les petits bruitages de Capy dans assets/sons/ (fabriqués ici, donc
// sans question de licence) :
// - fin.wav : fin d'étape, quatre notes qui montent (do, mi, sol, do) ;
// - coffre.wav : coffre ouvert, un carillon rapide qui scintille.
// Toujours doux et courts ; jamais de son après une erreur.
// Lancer avec : node scripts/generer-sons.js
const fs = require('fs');
const path = require('path');

const FREQUENCE = 22050;

/** Écrit un WAV mono 16 bits à partir de notes de clochette. */
function ecrire(nom, { duree, volume, notes, amortissement }) {
  const n = Math.round(FREQUENCE * duree);
  const donnees = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / FREQUENCE;
    let v = 0;
    for (const { hz, debut, force = 1 } of notes) {
      if (t < debut) continue;
      const u = t - debut;
      const attaque = Math.min(1, u / 0.008);
      const decroissance = Math.exp(-u * amortissement);
      v +=
        force *
        attaque *
        decroissance *
        (Math.sin(2 * Math.PI * hz * u) +
          0.25 * Math.sin(2 * Math.PI * hz * 2 * u) +
          0.08 * Math.sin(2 * Math.PI * hz * 3 * u));
    }
    const fondu = Math.min(1, (duree - t) / 0.06);
    donnees.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * volume * fondu)) * 32767), i * 2);
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
  const sortie = path.join(__dirname, '..', 'assets', 'sons', `${nom}.wav`);
  fs.writeFileSync(sortie, Buffer.concat([entete, donnees]));
  console.log(`Écrit : ${sortie}`);
}

ecrire('fin', {
  duree: 1.3,
  volume: 0.18,
  amortissement: 3.2,
  notes: [
    { hz: 523.25, debut: 0 },
    { hz: 659.25, debut: 0.14 },
    { hz: 783.99, debut: 0.28 },
    { hz: 1046.5, debut: 0.42, force: 1.1 },
  ],
});

ecrire('coffre', {
  duree: 1.4,
  volume: 0.14,
  amortissement: 3.8,
  notes: [880, 1108.73, 1318.51, 1760, 1318.51, 1760, 2217.46].map((hz, i) => ({
    hz,
    debut: i * 0.07,
    force: i === 6 ? 0.9 : 0.7,
  })),
});
