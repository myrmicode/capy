// Mots de la dictée (axe « Écrire des mots ») et fautes typiques d'orthographe.
// Les mots, leurs phrases et leurs difficultés sont des données ; les exercices,
// les indices, les explications et les mauvaises graphies sont fabriqués par le code.
// À FAIRE RELIRE par un enseignant : choix des mots et répartition en + / ++ / +++.
import type { NiveauDifficulte } from '../types';

/** Ce qui rend un mot difficile à écrire ; sert à l'indice et à l'explication. */
export type Difficulte =
  | { type: 'syllabes' }
  | { type: 'son'; son: string; graphie: string }
  | { type: 'muette'; lettre: string; parent?: string }
  | { type: 'h' }
  | { type: 'double'; lettre: string }
  | { type: 'mbp' }
  | { type: 'accent'; lettre: string }
  | { type: 'cedille' }
  | { type: 'invariable' };

export interface MotDictee {
  mot: string;
  /** Phrase dite par Capy, qui contient le mot une seule fois (et pas en premier). */
  phrase: string;
  niveau: NiveauDifficulte;
  difficultes: readonly Difficulte[];
}

const syl: Difficulte = { type: 'syllabes' };
const son = (s: string, graphie: string): Difficulte => ({ type: 'son', son: s, graphie });
const muette = (lettre: string, parent?: string): Difficulte => ({
  type: 'muette',
  lettre,
  ...(parent ? { parent } : {}),
});
const double = (lettre: string): Difficulte => ({ type: 'double', lettre });
const accent = (lettre: string): Difficulte => ({ type: 'accent', lettre });
const mbp: Difficulte = { type: 'mbp' };
const inv: Difficulte = { type: 'invariable' };

const m = (mot: string, niveau: NiveauDifficulte, phrase: string, ...difficultes: Difficulte[]): MotDictee => ({
  mot,
  niveau,
  phrase,
  difficultes: difficultes.length > 0 ? difficultes : [syl],
});

/**
 * Mots à écrire. + : chaque son s'écrit simplement ; ++ : sons à plusieurs lettres,
 * lettres muettes, c / g doux ; +++ : consonnes doubles, m devant b et p, h muet.
 */
export const MOTS_DICTEE: readonly MotDictee[] = [
  // +
  m('vélo', 1, 'Je roule à vélo dans la rue.', accent('é')),
  m('moto', 1, 'La moto fait du bruit.'),
  m('tomate', 1, 'Maman coupe une tomate rouge.'),
  m('salade', 1, 'Le lapin mange la salade.'),
  m('cabane', 1, 'Nous avons construit une cabane dans le jardin.'),
  m('canapé', 1, 'Papa lit sur le canapé.', accent('é')),
  m('robe', 1, 'Ma sœur porte une robe bleue.'),
  m('pirate', 1, 'Le pirate cherche un trésor.'),
  m('domino', 1, 'Je pose un domino sur la table.'),
  m('poule', 1, 'La poule picore dans la cour.'),
  m('mouton', 1, 'Le mouton broute l’herbe.'),
  m('route', 1, 'La route monte jusqu’au village.'),
  m('lapin', 1, 'Le lapin saute dans le pré.'),
  m('chemin', 1, 'Ce chemin mène à la forêt.'),
  m('tulipe', 1, 'Une tulipe a poussé au jardin.'),
  m('samedi', 1, 'Le samedi, je vais à la piscine.'),
  m('banane', 1, 'Je mange une banane au goûter.'),
  m('pantalon', 1, 'Il a mis son pantalon vert.'),
  m('matin', 1, 'Ce matin, il fait froid.'),
  m('dimanche', 1, 'Le dimanche, nous allons au parc.'),
  m('pyjama', 1, 'Je mets mon pyjama pour dormir.'),
  m('lavabo', 1, 'Je me lave les mains au lavabo.'),
  m('école', 1, 'Je vais à l’école à pied.', accent('é')),
  m('été', 1, 'En été, il fait chaud.', accent('é')),
  // ++
  m('bateau', 2, 'Le bateau glisse sur l’eau.', son('o', 'eau')),
  m('chapeau', 2, 'Grand-père porte un chapeau de paille.', son('o', 'eau')),
  m('gâteau', 2, 'Nous mangeons un gâteau au chocolat.', son('o', 'eau'), accent('â')),
  m('jaune', 2, 'Le soleil est jaune.', son('o', 'au')),
  m('maison', 2, 'Notre maison a un toit rouge.', son('è', 'ai'), son('z', 's')),
  m('oiseau', 2, 'Un oiseau chante dans l’arbre.', son('z', 's'), son('o', 'eau')),
  m('poisson', 2, 'Le poisson nage dans le bocal.', son('s', 'ss')),
  m('montagne', 2, 'Nous marchons dans la montagne.', son('gn', 'gn')),
  m('famille', 2, 'Toute la famille est à table.', son('ille', 'ille')),
  m('photo', 2, 'Je regarde une photo de vacances.', son('f', 'ph')),
  m('pain', 2, 'Je coupe du pain pour le repas.', son('in', 'ain')),
  m('main', 2, 'Lève la main pour parler.', son('in', 'ain')),
  m('neige', 2, 'La neige tombe sur le toit.', son('è', 'ei'), son('j', 'g')),
  m('soleil', 2, 'Le soleil brille fort.', son('eil', 'eil')),
  m('chat', 2, 'Le chat dort sur le canapé.', muette('t', 'chaton')),
  m('lit', 2, 'Je fais mon lit le matin.', muette('t')),
  m('loup', 2, 'Le loup hurle dans la forêt.', muette('p', 'louve')),
  m('souris', 2, 'La souris grignote du fromage.', muette('s', 'souriceau')),
  m('dent', 2, 'J’ai perdu une dent.', son('an', 'en'), muette('t', 'dentiste')),
  m('tapis', 2, 'Les jouets sont sur le tapis.', muette('s', 'tapisser')),
  m('bras', 2, 'Elle porte son sac sur le bras.', muette('s', 'brassard')),
  m('vent', 2, 'Le vent souffle très fort.', son('an', 'en'), muette('t')),
  m('garçon', 2, 'Ce garçon court vite.', { type: 'cedille' }),
  m('girafe', 2, 'La girafe mange des feuilles.', son('j', 'g')),
  m('cinéma', 2, 'Nous allons au cinéma samedi.', son('s', 'c'), accent('é')),
  m('quatre', 2, 'J’ai quatre crayons.', son('k', 'qu')),
  m('guitare', 2, 'Mon frère joue de la guitare.', son('g', 'gu')),
  m('jouet', 2, 'Ce jouet est cassé.', muette('t')),
  // +++
  m('pomme', 3, 'Je croque une pomme verte.', double('m')),
  m('ballon', 3, 'Le ballon roule sous la table.', double('l')),
  m('carotte', 3, 'Le lapin aime la carotte.', double('t')),
  m('lettre', 3, 'J’écris une lettre à ma tante.', double('t')),
  m('personne', 3, 'Il n’y a personne dans la salle.', double('n')),
  m('jambe', 3, 'Il s’est fait mal à la jambe.', mbp),
  m('pompier', 3, 'Le pompier éteint le feu.', mbp),
  m('tempête', 3, 'La tempête a cassé une branche.', mbp, accent('ê')),
  m('champ', 3, 'La vache est dans le champ.', mbp, muette('p')),
  m('trompette', 3, 'Ma cousine joue de la trompette.', mbp, double('t')),
  m('chambre', 3, 'Je range ma chambre le samedi.', mbp),
  m('sommeil', 3, 'Après le repas, j’ai sommeil.', double('m'), son('eil', 'eil')),
  m('grenouille', 3, 'La grenouille saute dans la mare.', son('ouille', 'ouille')),
  m('escargot', 3, 'Un escargot avance lentement.', muette('t')),
  m('hiver', 3, 'En hiver, il neige souvent.', { type: 'h' }),
  m('heureux', 3, 'Je suis heureux de te voir.', { type: 'h' }, muette('x', 'heureuse')),
  m('colle', 3, 'Il faut de la colle pour ce bricolage.', double('l')),
  m('lunettes', 3, 'Mamie cherche ses lunettes.', double('t'), muette('s')),
];

/**
 * Petits mots invariables à connaître par cœur, du plus courant au plus long.
 */
export const MOTS_OUTILS: readonly MotDictee[] = [
  // +
  m('avec', 1, 'Je joue avec mon chien.', inv),
  m('dans', 1, 'Le livre est dans mon sac.', inv),
  m('mais', 1, 'Il pleut, mais nous sortons quand même.', inv),
  m('puis', 1, 'Je me lave, puis je m’habille.', inv),
  m('alors', 1, 'Il fait froid, alors je mets un bonnet.', inv),
  m('après', 1, 'Nous jouerons après le goûter.', inv, accent('è')),
  m('très', 1, 'Ce gâteau est très bon.', inv, accent('è')),
  m('aussi', 1, 'Moi aussi, j’aime les crêpes.', inv),
  m('hier', 1, 'Nous sommes allés au parc hier.', inv),
  m('demain', 1, 'Nous irons à la piscine demain.', inv),
  // ++
  m('toujours', 2, 'Mon chat dort toujours sur mon lit.', inv),
  m('souvent', 2, 'Nous allons souvent chez mamie.', inv),
  m('jamais', 2, 'Je ne mange jamais de piment.', inv),
  m('encore', 2, 'Je veux encore jouer.', inv),
  m('ensuite', 2, 'Je range ma chambre, ensuite je lis.', inv),
  m('depuis', 2, 'Il pleut depuis ce matin.', inv),
  m('devant', 2, 'Le chien attend devant la porte.', inv),
  m('derrière', 2, 'Le ballon est derrière l’arbre.', inv, accent('è')),
  m('pendant', 2, 'Je lis pendant le trajet.', inv),
  m('déjà', 2, 'J’ai déjà fini mon dessin.', inv, accent('é'), accent('à')),
  m('bientôt', 2, 'Ce sera bientôt les vacances.', inv, accent('ô')),
  // +++
  m('beaucoup', 3, 'J’aime beaucoup les fraises.', inv),
  m('maintenant', 3, 'Il est l’heure de dormir maintenant.', inv),
  m('longtemps', 3, 'Nous avons marché longtemps.', inv),
  m('aujourd’hui', 3, 'Il fait beau aujourd’hui.', inv),
  m('quelquefois', 3, 'Je vais quelquefois à la bibliothèque.', inv),
  m('d’abord', 3, 'Lave-toi d’abord les mains.', inv),
  m('parfois', 3, 'Le soir, je regarde parfois un dessin animé.', inv),
  m('combien', 3, 'Tu as combien de billes ?', inv),
  m('plusieurs', 3, 'J’ai plusieurs cousins.', inv),
  m('autrefois', 3, 'Il y avait un moulin ici autrefois.', inv),
];

// --- Indice et explication ---

const nombreDeLettres = (graphie: string) =>
  graphie.length === 1
    ? 'une seule lettre'
    : `${['', '', 'deux', 'trois', 'quatre', 'cinq', 'six'][graphie.length]} lettres`;

/** Indice tiré de la difficulté principale du mot ; il ne donne jamais le mot. */
export function indiceDictee(mot: MotDictee): string {
  const d = mot.difficultes[0];
  switch (d.type) {
    case 'syllabes':
      return 'Dis le mot tout bas, syllabe par syllabe, et écris chaque son que tu entends.';
    case 'son':
      return `Écoute bien le son « ${d.son} » : dans ce mot, il s’écrit avec ${nombreDeLettres(d.graphie)}.`;
    case 'muette':
      return d.parent
        ? `Une lettre ne s’entend pas à la fin. Pense à « ${d.parent} » pour la retrouver.`
        : 'Une lettre ne s’entend pas à la fin du mot.';
    case 'h':
      return 'Ce mot commence par une lettre qu’on n’entend pas.';
    case 'double':
      return 'Dans ce mot, une consonne s’écrit deux fois.';
    case 'mbp':
      return 'Devant b ou p, on n’écrit pas n : on écrit m.';
    case 'accent':
      return 'Écoute le son « é », « è » ou « a » : il faut un accent.';
    case 'cedille':
      return 'Le son « s » s’écrit avec un c, mais il lui faut une petite queue.';
    case 'invariable':
      return 'C’est un petit mot invariable : il garde la même forme partout. Pense à ses lettres une par une.';
  }
}

function remarque(d: Difficulte): string {
  switch (d.type) {
    case 'syllabes':
      return 'Chaque son s’entend et s’écrit.';
    case 'son':
      return d.son === d.graphie ? `On entend « ${d.son} ».` : `Le son « ${d.son} » s’écrit « ${d.graphie} ».`;
    case 'muette':
      return d.parent
        ? `Le « ${d.lettre} » de la fin ne s’entend pas, mais on l’entend dans « ${d.parent} ».`
        : `Le « ${d.lettre} » de la fin ne s’entend pas.`;
    case 'h':
      return 'Il commence par un « h » qu’on n’entend pas.';
    case 'double':
      return `Il faut deux « ${d.lettre} ».`;
    case 'mbp':
      return 'Devant « b » ou « p », on écrit « m ».';
    case 'accent':
      return `Il y a un accent sur le « ${d.lettre} ».`;
    case 'cedille':
      return 'La cédille sous le « c » fait le son « s ».';
    case 'invariable':
      return 'C’est un mot invariable : il s’écrit toujours de la même façon.';
  }
}

/** Indice en FALC : des phrases courtes, une idée par phrase. */
export function indiceDicteeFacile(mot: MotDictee): string {
  const d = mot.difficultes[0];
  switch (d.type) {
    case 'syllabes':
      return 'Dis le mot tout bas. Écris chaque son.';
    case 'son':
      return `Écoute le son « ${d.son} ». Ici, il s’écrit avec ${nombreDeLettres(d.graphie)}.`;
    case 'muette':
      return d.parent
        ? `Une lettre ne s’entend pas à la fin. Pense à « ${d.parent} ».`
        : 'Une lettre ne s’entend pas à la fin.';
    case 'h':
      return 'La première lettre ne s’entend pas.';
    case 'double':
      return 'Une consonne s’écrit deux fois.';
    case 'mbp':
      return 'Devant b ou p, on écrit m.';
    case 'accent':
      return 'Il faut un accent.';
    case 'cedille':
      return 'Le c a besoin d’une petite queue.';
    case 'invariable':
      return 'Ce petit mot ne change pas. Pense à ses lettres.';
  }
}

function remarqueFacile(d: Difficulte): string {
  switch (d.type) {
    case 'muette':
      return d.parent
        ? `On n’entend pas le « ${d.lettre} » de la fin. On l’entend dans « ${d.parent} ».`
        : `On n’entend pas le « ${d.lettre} » de la fin.`;
    case 'invariable':
      return 'Ce mot s’écrit toujours pareil.';
    default:
      return remarque(d);
  }
}

export function explicationDicteeFacile(mot: MotDictee): string {
  return `On écrit « ${mot.mot} » : ${epeler(mot.mot)}. ${mot.difficultes.map(remarqueFacile).join(' ')}`;
}

/** « b-a-t-e-a-u » : le mot épelé lettre par lettre. */
export function epeler(mot: string): string {
  return [...mot].join('-');
}

export function explicationDictee(mot: MotDictee): string {
  return `On écrit « ${mot.mot} » : ${epeler(mot.mot)}. ${mot.difficultes.map(remarque).join(' ')}`;
}

// --- Fautes typiques ---

const VOYELLE = '[aeiouyéèêâîôû]';

/** Erreurs d'orthographe fréquentes à l'école : graphies du même son, lettres oubliées ou ajoutées. */
const REGLES_FAUTES: readonly (readonly [RegExp, string, string])[] = [
  [/eau/, 'o', 'son « o » écrit o'],
  [/eau/, 'au', 'son « o » écrit au'],
  [/(?<!e)au/, 'o', 'son « o » écrit o'],
  [/ai/, 'è', 'son « è » écrit è'],
  [/ai/, 'é', 'son « è » écrit é'],
  [/ei/, 'è', 'son « è » écrit è'],
  [/oi/, 'oa', 'son « oi » écrit oa'],
  [/ph/, 'f', 'son « f » écrit f'],
  [/qu/, 'k', 'son « k » écrit k'],
  [/gu(?=[eiy])/, 'g', 'u oublié après g'],
  [/gn/, 'ni', 'son « gn » écrit ni'],
  [/ill/, 'y', 'son « ill » écrit y'],
  [/ain/, 'in', 'son « in » écrit in'],
  [/ein/, 'in', 'son « in » écrit in'],
  [/en/, 'an', 'son « an » écrit an'],
  [/an/, 'en', 'son « an » écrit en'],
  [/m(?=[bp])/, 'n', 'n au lieu de m devant b ou p'],
  [/am(?=[bp])/, 'em', 'son « an » écrit em'],
  [/em(?=[bp])/, 'am', 'son « an » écrit am'],
  [/([ao])n(?=[cdfgjklqrstvz])/, '$1m', 'm au lieu de n'],
  [/([bcdfglmnprst])\1/, '$1', 'consonne double oubliée'],
  [/([bcdfglmnprst])\1e$/, '$1', 'fin du mot oubliée'],
  [new RegExp(`(?<=${VOYELLE})([bdfglmnprt])(?=${VOYELLE})`), '$1$1', 'consonne doublée sans raison'],
  [/(?<=[bcdfgjlmnprstvz])e(?=[bcdfgjlmnprstvz][aeiouyéèê])/, '', 'e muet oublié'],
  [/(?<=[bcdfgjlmnprstvz])e(?=[bcdfgjlmnprstvz])/, 'é', 'accent ajouté'],
  [/c(?=[aou]|$)/, 'k', 'son « k » écrit k'],
  [/qu/, 'c', 'son « k » écrit c'],
  [/oi/, 'wa', 'son « oi » écrit wa'],
  [/y/, 'i', 'y écrit i'],
  [/ier$/, 'ié', 'son « é » écrit é'],
  [new RegExp(`(?<=${VOYELLE})s(?=${VOYELLE})`), 'z', 'son « z » écrit z'],
  [/c(?=[eiyéè])/, 's', 'son « s » écrit s'],
  [/g(?=[eiyéè])/, 'j', 'son « j » écrit j'],
  [/ç/, 's', 'son « s » écrit s'],
  [/ç/, 'c', 'cédille oubliée'],
  [/é/, 'e', 'accent oublié'],
  [/è/, 'e', 'accent oublié'],
  [/é/, 'è', 'mauvais accent'],
  [/[èê]/, 'é', 'mauvais accent'],
  [/â/, 'a', 'accent oublié'],
  [/à/, 'a', 'accent oublié'],
  [/ô/, 'o', 'accent oublié'],
  [/^h/, '', 'h muet oublié'],
  [/[tdspx]$/, '', 'lettre muette oubliée'],
  [/([aiouéy])$/, '$1t', 'lettre muette ajoutée'],
  [/([aeoi]n)$/, '$1t', 'lettre muette ajoutée'],
  [/t$/, 's', 'mauvaise lettre muette'],
  [/s$/, 't', 'mauvaise lettre muette'],
  [/p$/, 't', 'mauvaise lettre muette'],
  [/x$/, 's', 'mauvaise lettre muette'],
  [/o$/, 'eau', 'son « o » écrit eau'],
  [/é$/, 'er', 'son « é » écrit er'],
  [/e$/, '', 'e final oublié'],
  [/([bcdfgklmnprstvz])$/, '$1e', 'e final ajouté'],
  [new RegExp(`o(?!u|i|[nm](?!${VOYELLE}))`), 'au', 'son « o » écrit au'],
  [/’/, '', 'apostrophe oubliée'],
  [/ou/, 'o', 'son « ou » écrit o'],
];

/** Applique une règle à la n-ième occurrence seulement (une seule faute par graphie). */
function remplacerOccurrence(mot: string, motif: RegExp, remplacement: string, n: number): string {
  let k = 0;
  return mot.replace(new RegExp(motif.source, `${motif.flags}g`), (trouve: string, ...args: unknown[]) => {
    if (k++ !== n) return trouve;
    const groupe = typeof args[0] === 'string' ? args[0] : '';
    return remplacement.replace(/\$1/g, groupe);
  });
}

/** Toutes les fautes typiques pour ce mot, sans doublon et toutes différentes du mot. */
export function fautesTypiques(mot: string): { valeur: string; erreur: string }[] {
  const vues = new Set([mot]);
  const fautes: { valeur: string; erreur: string }[] = [];
  for (const [motif, remplacement, erreur] of REGLES_FAUTES) {
    const occurrences = [...mot.matchAll(new RegExp(motif.source, `${motif.flags}g`))].length;
    for (let n = 0; n < occurrences; n++) {
      const valeur = remplacerOccurrence(mot, motif, remplacement, n);
      if (valeur.length < 2 || vues.has(valeur)) continue;
      vues.add(valeur);
      fautes.push({ valeur, erreur });
    }
  }
  return fautes;
}

// --- Comparaison de la saisie ---

/** Apostrophes, espaces et majuscules ne comptent pas ; les accents, si. */
export function normaliserSaisie(texte: string): string {
  return texte
    .trim()
    .toLowerCase()
    .replace(/['‘`´]/g, '’')
    .replace(/\s+/g, ' ');
}

export function saisieJuste(saisie: string, mot: string): boolean {
  return normaliserSaisie(saisie) === normaliserSaisie(mot);
}

const sansAccents = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '');

/** Petit conseil bienveillant sur une saisie qui n'est pas encore le mot attendu. */
export function conseilSaisie(saisie: string, mot: string): string {
  const s = normaliserSaisie(saisie);
  const attendu = normaliserSaisie(mot);
  if (sansAccents(s) === sansAccents(attendu)) return 'Toutes les lettres sont là. Regarde bien les accents.';
  const ecart = [...attendu].length - [...s].length;
  if (ecart === 1) return 'Il manque une lettre.';
  if (ecart > 1) return 'Il manque quelques lettres.';
  if (ecart === -1) return 'Il y a une lettre en trop.';
  if (ecart < -1) return 'Il y a quelques lettres en trop.';
  const differences = [...s].filter((c, i) => c !== [...attendu][i]).length;
  return differences === 1 ? 'Une seule lettre est à changer.' : 'Réécoute le mot, syllabe par syllabe.';
}
