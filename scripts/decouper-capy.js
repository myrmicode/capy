// Découpe la planche de Capy (assets/capy-source/planche-capy.png) en images de
// l'appli, dans assets/capy/. Le fond clair autour de chaque dessin devient
// transparent (remplissage depuis les bords), pour que Capy se pose sur tous les
// fonds de l'appli, y compris les fonds teintés des réglages de lecture.
//
// Usage : node scripts/decouper-capy.js
const Jimp = require('jimp-compact');

const SOURCE = 'assets/capy-source/planche-capy.png';
const DOSSIER = 'assets/capy';

/**
 * Nom du fichier → [x, y, largeur, hauteur] dans la planche, transparence ou non,
 * et colonnes à effacer à droite (un bout du dessin voisin). La largeur de capy
 * reste 380 : les objets de composants/CapyHabille.tsx sont placés dans ce repère.
 */
const DECOUPES = {
  capy: [330, 20, 380, 385, true, 12],
  heureux: [32, 465, 108, 130, true],
  surpris: [135, 465, 110, 130, true],
  'clin-oeil': [245, 465, 110, 130, true],
  triste: [355, 465, 110, 130, true],
  serieux: [462, 465, 112, 130, true],
  fier: [570, 465, 135, 130, true],
  exploration: [25, 695, 165, 160, true],
  apprendre: [195, 695, 145, 160, true],
  reflechi: [360, 680, 150, 175, true],
  bravo: [525, 690, 170, 165, true],
  explorer: [25, 895, 165, 140, true],
  conseils: [195, 895, 135, 140, true],
  reussite: [335, 880, 175, 160, true],
  ralentir: [510, 900, 185, 135, true],
  'icone-appli': [36, 36, 266, 266, true],
  // Le bandeau s'arrête avant la phrase écrite dans l'image : elle ne peut pas être coupée.
  paysage: [0, 1082, 905, 172, false],
};

/** Écart de couleur (0 à 441) en dessous duquel un pixel relié au bord est du fond. */
const SEUIL_FOND = 26;
/** Jusqu'à cet écart, le pixel du bord est à moitié transparent (contour adouci). */
const SEUIL_BORD = 48;

function rendreFondTransparent(img) {
  const { width: l, height: h, data } = img.bitmap;
  const coins = [0, l - 1, (h - 1) * l, h * l - 1].map((i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]);
  const ref = coins.reduce((a, c) => a.map((v, k) => v + c[k] / coins.length), [0, 0, 0]);
  const ecart = (i) => Math.hypot(data[i * 4] - ref[0], data[i * 4 + 1] - ref[1], data[i * 4 + 2] - ref[2]);
  const vu = new Uint8Array(l * h);
  const pile = [];
  for (let x = 0; x < l; x++) pile.push(x, (h - 1) * l + x);
  for (let y = 0; y < h; y++) pile.push(y * l, y * l + l - 1);
  while (pile.length) {
    const i = pile.pop();
    if (vu[i]) continue;
    vu[i] = 1;
    const e = ecart(i);
    if (e >= SEUIL_BORD) continue;
    if (e < SEUIL_FOND) {
      data[i * 4 + 3] = 0;
      const x = i % l;
      if (x > 0) pile.push(i - 1);
      if (x < l - 1) pile.push(i + 1);
      if (i >= l) pile.push(i - l);
      if (i < (h - 1) * l) pile.push(i + l);
    } else {
      data[i * 4 + 3] = Math.round((255 * (e - SEUIL_FOND)) / (SEUIL_BORD - SEUIL_FOND));
    }
  }
}

(async () => {
  const planche = await Jimp.read(SOURCE);
  for (const [nom, [x, y, l, h, transparent, effacerDroite = 0]] of Object.entries(DECOUPES)) {
    const img = planche.clone().crop(x, y, l, h);
    if (transparent) rendreFondTransparent(img);
    for (let i = 0; i < l * h; i++) if (i % l >= l - effacerDroite) img.bitmap.data[i * 4 + 3] = 0;
    await img.writeAsync(`${DOSSIER}/${nom}.png`);
  }
  // Icône de l'appli, de l'écran de démarrage et du site : carrée, 1024 px.
  const icone = await Jimp.read(`${DOSSIER}/icone-appli.png`);
  await icone.clone().resize(1024, 1024, Jimp.RESIZE_BICUBIC).writeAsync(`${DOSSIER}/icone-appli-carree.png`);
  // Icône adaptative Android : le lanceur n'affiche que le centre (66 %) de l'image ;
  // la tuile est donc réduite au milieu, sur fond menthe (backgroundColor dans app.json).
  const adaptative = new Jimp(1024, 1024, 0x00000000);
  adaptative.composite(icone.clone().resize(720, 720, Jimp.RESIZE_BICUBIC), 152, 152);
  await adaptative.writeAsync(`${DOSSIER}/icone-adaptative.png`);
  // Icônes du site installable (assets/web) ; la « maskable » garde le dessin dans la zone sûre, sur fond crème.
  for (const t of [192, 512])
    await icone.clone().resize(t, t, Jimp.RESIZE_BICUBIC).writeAsync(`assets/web/icone-${t}.png`);
  const fond = new Jimp(512, 512, 0xfaf9f5ff);
  fond.composite(icone.clone().resize(410, 410, Jimp.RESIZE_BICUBIC), 51, 51);
  await fond.writeAsync('assets/web/icone-maskable-512.png');
  console.log(`${Object.keys(DECOUPES).length} images découpées dans ${DOSSIER}/`);
})();
