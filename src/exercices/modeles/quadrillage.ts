/**
 * Se repérer et se déplacer sur un quadrillage (atelier « Les formes », du CP
 * au CM2) :
 * - suivre un chemin de flèches et trouver la case d'arrivée ;
 * - repérer une case par sa lettre et son chiffre (« C2 »), ou trouver ce qui
 *   est dans une case ;
 * - écrire le chemin qui mène à un objet (un tout petit programme).
 * Les mauvaises réponses viennent des erreurs typiques : haut et bas confondus,
 * gauche et droite confondues, une flèche oubliée, lettre et chiffre inversés.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import type { Classe } from '@/config/classes';
import { motImagier } from '@/contenu/imagier';

import type { Alea } from '../alea';
import { definirModeleTexte, majuscule } from '../francais/moteur';
import type { Case, DistracteurTexte, IllustrationQuadrillage, NiveauDifficulte } from '../types';

export const FLECHES = ['→', '←', '↑', '↓'] as const;
export type Fleche = (typeof FLECHES)[number];

const PAS: Record<Fleche, Case> = {
  '→': { colonne: 1, ligne: 0 },
  '←': { colonne: -1, ligne: 0 },
  '↑': { colonne: 0, ligne: -1 },
  '↓': { colonne: 0, ligne: 1 },
};

/** Ce que dit Capy pour chaque flèche. */
export const NOMS_FLECHES: Record<Fleche, string> = {
  '→': 'droite',
  '←': 'gauche',
  '↑': 'haut',
  '↓': 'bas',
};

const INVERSE: Record<Fleche, Fleche> = { '→': '←', '←': '→', '↑': '↓', '↓': '↑' };

export const LETTRES_COLONNES = 'ABCDEFGH';

export function deplacer(depart: Case, chemin: readonly Fleche[]): Case {
  return chemin.reduce((c, f) => ({ colonne: c.colonne + PAS[f].colonne, ligne: c.ligne + PAS[f].ligne }), depart);
}

/** Chaque case du trajet reste-t-elle dans la grille ? */
export function cheminDansLaGrille(depart: Case, chemin: readonly Fleche[], colonnes: number, lignes: number): boolean {
  let c = depart;
  for (const f of chemin) {
    c = deplacer(c, [f]);
    if (!dansLaGrille(c, colonnes, lignes)) return false;
  }
  return true;
}

export function dansLaGrille(c: Case, colonnes: number, lignes: number): boolean {
  return c.colonne >= 0 && c.colonne < colonnes && c.ligne >= 0 && c.ligne < lignes;
}

export const memeCase = (a: Case, b: Case) => a.colonne === b.colonne && a.ligne === b.ligne;

/** « → → ↑ » */
export const ecrireChemin = (chemin: readonly Fleche[]) => chemin.join(' ');

export function lireChemin(texte: string): Fleche[] {
  return texte.split(' ').filter((f): f is Fleche => (FLECHES as readonly string[]).includes(f));
}

/** « C2 » : la lettre de la colonne, puis le numéro de la ligne (1 en haut). */
export function nomCase(c: Case): string {
  return `${LETTRES_COLONNES[c.colonne]}${c.ligne + 1}`;
}

/** Des objets de l'imagier faciles à reconnaître, qui commencent tous par une consonne (« la pomme »). */
const OBJETS = [
  'pomme',
  'fraise',
  'ballon',
  'fleur',
  'maison',
  'gâteau',
  'cadeau',
  'soleil',
  'lune',
  'chapeau',
  'voiture',
  'bateau',
  'livre',
  'carotte',
  'banane',
  'glace',
] as const;

export function leNom(objet: string): string {
  return `${motImagier(objet)?.genre === 'f' ? 'la' : 'le'} ${objet}`;
}

/** Taille de la grille : plus grande au fil des classes. */
function taille(classe: Classe): { colonnes: number; lignes: number } {
  if (classe === 'CP') return { colonnes: 4, lignes: 4 };
  if (classe === 'CE1' || classe === 'CE2') return { colonnes: 5, lignes: 5 };
  return { colonnes: 6, lignes: 6 };
}

/** Nombre de flèches du chemin, selon la classe et le niveau. */
function longueur(classe: Classe, niveau: NiveauDifficulte): number {
  const base = classe === 'CP' ? 2 : classe === 'CE1' ? 3 : classe === 'CE2' ? 4 : 5;
  return base + niveau - 1;
}

function tirerCase(alea: Alea, colonnes: number, lignes: number): Case {
  return { colonne: alea.entier(0, colonnes - 1), ligne: alea.entier(0, lignes - 1) };
}

/** Un chemin qui reste dans la grille ; au niveau +, il ne change de direction qu'une fois. */
function tirerChemin(alea: Alea, depart: Case, n: number, niveau: NiveauDifficulte, colonnes: number, lignes: number) {
  const chemin: Fleche[] = [];
  if (niveau === 1) {
    const [a, b] = alea.melanger([alea.choix(['→', '←'] as const), alea.choix(['↑', '↓'] as const)]);
    const k = alea.entier(1, n - 1);
    for (let i = 0; i < n; i++) chemin.push(i < k ? a : b);
  } else {
    for (let i = 0; i < n; i++) {
      // Jamais de retour en arrière immédiat : il annulerait la flèche d'avant.
      const possibles = FLECHES.filter((f) => i === 0 || f !== INVERSE[chemin[i - 1]]);
      chemin.push(alea.choix(possibles));
    }
  }
  return cheminDansLaGrille(depart, chemin, colonnes, lignes) ? chemin : null;
}

/** Les chemins des erreurs typiques, à partir du bon. */
function cheminsFautifs(chemin: readonly Fleche[]): { chemin: Fleche[]; erreur: string }[] {
  const verticale = (f: Fleche) => f === '↑' || f === '↓';
  return [
    { chemin: chemin.map((f) => (verticale(f) ? INVERSE[f] : f)), erreur: 'haut et bas confondus' },
    { chemin: chemin.map((f) => (verticale(f) ? f : INVERSE[f])), erreur: 'gauche et droite confondues' },
    { chemin: chemin.slice(0, -1), erreur: 'la dernière flèche oubliée' },
    { chemin: [...chemin, chemin[chemin.length - 1]], erreur: 'une flèche de trop' },
    { chemin: chemin.slice(1), erreur: 'la première flèche oubliée' },
  ];
}

/** Une grille avec Capy, l'objet d'arrivée et les objets des erreurs typiques, sur des cases toutes différentes. */
function grilleAvecPieges(
  alea: Alea,
  classe: Classe,
  niveau: NiveauDifficulte,
): {
  illustration: IllustrationQuadrillage;
  chemin: Fleche[];
  pieges: { objet: string; erreur: string }[];
  objet: string;
} | null {
  const { colonnes, lignes } = taille(classe);
  const depart = tirerCase(alea, colonnes, lignes);
  const chemin = tirerChemin(alea, depart, longueur(classe, niveau), niveau, colonnes, lignes);
  if (!chemin) return null;
  const arrivee = deplacer(depart, chemin);
  if (memeCase(arrivee, depart)) return null;
  const objets = alea.melanger([...OBJETS]);
  const poses: (Case & { objet: string })[] = [{ ...arrivee, objet: objets[0] }];
  const pieges: { objet: string; erreur: string }[] = [];
  for (const f of cheminsFautifs(chemin)) {
    const c = deplacer(depart, f.chemin);
    if (!dansLaGrille(c, colonnes, lignes) || memeCase(c, depart) || poses.some((p) => memeCase(p, c))) continue;
    const objet = objets[poses.length];
    poses.push({ ...c, objet });
    pieges.push({ objet, erreur: f.erreur });
  }
  if (pieges.length < 2) return null;
  return {
    illustration: { type: 'quadrillage', colonnes, lignes, depart, objets: alea.melanger(poses) },
    chemin,
    pieges,
    objet: objets[0],
  };
}

const PHRASE_FLECHES = (chemin: readonly Fleche[]) => chemin.map((f) => NOMS_FLECHES[f]).join(', ');

export const suivreChemin = definirModeleTexte({
  id: 'suivre-chemin',
  titre: 'Suivre les flèches',
  domaine: 'geometrie',
  competence: 'Se déplacer sur un quadrillage en suivant un chemin codé par des flèches.',
  classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  // + : deux directions seulement ; ++ et +++ : des chemins plus longs qui tournent souvent.
  construire: (alea, classe, niveau) => {
    const g = grilleAvecPieges(alea, classe, niveau);
    if (!g) return null;
    const reponse = leNom(g.objet);
    return {
      enonce: `Capy part de sa case et suit les flèches : ${ecrireChemin(g.chemin)}.`,
      question: 'Sur quelle case arrive Capy ?',
      illustration: g.illustration,
      reponse,
      distracteurs: g.pieges.map((p) => ({ valeur: leNom(p.objet), erreur: p.erreur })),
      indice: 'Pose ton doigt sur Capy. Avance d’une case pour chaque flèche, dans l’ordre.',
      explication: `En suivant les ${g.chemin.length} flèches une par une, Capy arrive sur ${reponse}.`,
      facile: {
        indice: 'Pose ton doigt sur Capy. Une flèche, une case.',
        explication: `Capy suit les flèches. Il arrive sur ${reponse}.`,
      },
    };
  },
});

export const ecrireLeChemin = definirModeleTexte({
  id: 'coder-chemin',
  titre: 'Écrire le chemin',
  domaine: 'geometrie',
  competence:
    'Coder un déplacement sur un quadrillage avec des flèches : un petit programme pour aller d’une case à une autre.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  // + : deux directions ; ++ et +++ : des chemins plus longs. Le bon chemin va d'abord à l'horizontale.
  construire: (alea, classe, niveau) => {
    const g = grilleAvecPieges(alea, classe, niveau);
    if (!g) return null;
    const depart = g.illustration.depart!;
    const arrivee = deplacer(depart, g.chemin);
    // Le chemin le plus court, rangé : les flèches horizontales, puis les verticales.
    const dc = arrivee.colonne - depart.colonne;
    const dl = arrivee.ligne - depart.ligne;
    const court: Fleche[] = [
      ...Array<Fleche>(Math.abs(dc)).fill(dc > 0 ? '→' : '←'),
      ...Array<Fleche>(Math.abs(dl)).fill(dl > 0 ? '↓' : '↑'),
    ];
    const reponse = ecrireChemin(court);
    const nom = leNom(g.objet);
    // Seuls les chemins qui mènent ailleurs sont de mauvaises réponses.
    const distracteurs: DistracteurTexte[] = cheminsFautifs(court)
      .filter((f) => f.chemin.length > 0 && !memeCase(deplacer(depart, f.chemin), arrivee))
      .map((f) => ({ valeur: ecrireChemin(f.chemin), erreur: f.erreur }));
    return {
      enonce: `Capy veut aller sur ${nom}.`,
      question: 'Quel chemin doit-il suivre ?',
      illustration: g.illustration,
      reponse,
      distracteurs: alea.melanger(distracteurs),
      indice: `Compte les cases vers la droite ou la gauche, puis vers le haut ou le bas, jusqu’à ${nom}.`,
      explication: `Pour aller sur ${nom}, Capy suit ${reponse} : ${PHRASE_FLECHES(court)}.`,
      facile: {
        indice: 'Compte les cases sur le côté. Puis en haut ou en bas.',
        explication: `Capy suit ${reponse}. Il arrive sur ${nom}.`,
      },
    };
  },
});

export const repererCase = definirModeleTexte({
  id: 'reperer-case',
  titre: 'Repérer une case',
  domaine: 'geometrie',
  competence:
    'Repérer une case d’un quadrillage par sa lettre et son chiffre, et retrouver une case à partir de son nom.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  // + : nommer la case d'un objet ; ++ et +++ : aussi trouver l'objet d'une case donnée, sur une grille plus grande.
  construire: (alea, classe, niveau) => {
    const { colonnes, lignes } = niveau === 1 ? { colonnes: 4, lignes: 4 } : taille(classe);
    const cible = tirerCase(alea, colonnes, lignes);
    // Lettre et chiffre inversés : il faut une grille carrée et une case hors de la diagonale.
    const inversee = { colonne: cible.ligne, ligne: cible.colonne };
    const voisines = [
      { colonne: cible.colonne + 1, ligne: cible.ligne, erreur: 'colonne d’à côté' },
      { colonne: cible.colonne - 1, ligne: cible.ligne, erreur: 'colonne d’à côté' },
      { colonne: cible.colonne, ligne: cible.ligne + 1, erreur: 'ligne d’à côté' },
      { colonne: cible.colonne, ligne: cible.ligne - 1, erreur: 'ligne d’à côté' },
    ];
    const pieges = [
      ...(memeCase(inversee, cible) ? [] : [{ ...inversee, erreur: 'lettre et chiffre inversés' }]),
      ...alea.melanger(voisines),
    ].filter((c) => dansLaGrille(c, colonnes, lignes));
    const objets = alea.melanger([...OBJETS]);
    const poses = [cible, ...pieges.slice(0, 3)].map((c, i) => ({
      colonne: c.colonne,
      ligne: c.ligne,
      objet: objets[i],
    }));
    const illustration: IllustrationQuadrillage = {
      type: 'quadrillage',
      colonnes,
      lignes,
      objets: alea.melanger(poses),
      reperes: true,
    };
    const nom = nomCase(cible);
    const objet = leNom(objets[0]);
    const chercherObjet = niveau > 1 && alea.entier(0, 1) === 0;
    if (chercherObjet) {
      return {
        enonce: 'Voici la grille de Capy.',
        question: `Qu’y a-t-il dans la case ${nom} ?`,
        illustration,
        reponse: majuscule(objet),
        distracteurs: pieges.slice(0, 3).map((p, i) => ({ valeur: majuscule(leNom(objets[i + 1])), erreur: p.erreur })),
        indice: 'Trouve d’abord la colonne de la lettre, puis descends jusqu’à la ligne du chiffre.',
        explication: `La case ${nom} est dans la colonne ${nom[0]} et la ligne ${nom.slice(1)} : on y trouve ${objet}.`,
        facile: {
          indice: 'Trouve la lettre en haut. Puis le chiffre à gauche.',
          explication: `Dans la case ${nom}, il y a ${objet}.`,
        },
      };
    }
    return {
      enonce: 'Voici la grille de Capy.',
      question: `Dans quelle case est ${objet} ?`,
      illustration,
      reponse: nom,
      distracteurs: pieges.map((p) => ({ valeur: nomCase(p), erreur: p.erreur })),
      indice: 'Lis d’abord la lettre de la colonne, en haut, puis le chiffre de la ligne, à gauche.',
      explication: `${majuscule(objet)} est dans la colonne ${nom[0]} et la ligne ${nom.slice(1)} : c’est la case ${nom}.`,
      facile: {
        indice: 'La lettre est en haut. Le chiffre est à gauche.',
        explication: `${majuscule(objet)} est dans la case ${nom}.`,
      },
    };
  },
});
