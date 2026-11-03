/**
 * Comprendre à l'oral, avec des images (CP et CE1), comme dans les évaluations :
 * - « Comprendre des mots » : Capy dit un mot, l'enfant touche son dessin parmi
 *   quatre. Plus le niveau monte, plus le mot est rare et plus les autres dessins
 *   sont proches (même famille de sens : un hérisson parmi d'autres animaux) ;
 * - « Comprendre des phrases » : Capy dit une phrase, l'enfant touche la scène
 *   qui lui correspond. Les pièges sont ceux des évaluations : sur ou sous,
 *   gauche ou droite, un ou plusieurs, grand ou petit, la négation, deux
 *   informations à retenir, la relative (« le chien qui est sur la boîte »).
 *
 * Rien n'est écrit : l'enfant n'a pas besoin de savoir lire. À FAIRE RELIRE PAR UN ENSEIGNANT.
 */
import { avecArticle, IMAGIER, motImagier, type MotImagier } from '@/contenu/imagier';

import type { Alea } from '../../alea';
import type { DistracteurTexte, ElementScene, NiveauDifficulte, Scene } from '../../types';
import { definirModeleTexte, majuscule, type ContenuTexte } from '../moteur';

/** En CE1, le niveau + reprend le ++ du CP : les mots courants sont déjà connus. */
const NIVEAUX_ORAL_CE1: Record<NiveauDifficulte, NiveauDifficulte> = { 1: 2, 2: 3, 3: 3 };

// --- Comprendre des mots ---

/** Trois autres mots : d'autres familles au niveau +, de plus en plus de la même famille ensuite. */
function autresMots(alea: Alea, cible: MotImagier, niveau: NiveauDifficulte): MotImagier[] {
  const autres = IMAGIER.filter((i) => i.mot !== cible.mot);
  const proches = alea.melanger(autres.filter((i) => i.categorie === cible.categorie));
  // Au niveau +, des dessins faciles à reconnaître ; ensuite, des mots aussi peu fréquents que la cible.
  const loin = alea.melanger(autres.filter((i) => i.categorie !== cible.categorie && i.niveau <= Math.max(2, niveau)));
  const nombreProches = niveau === 1 ? 0 : niveau === 2 ? 1 : 3;
  const retenus = proches.slice(0, nombreProches);
  return [...retenus, ...loin.slice(0, 3 - retenus.length)];
}

export const comprendreMot = definirModeleTexte({
  id: 'comprendre-mot',
  titre: 'Le bon dessin',
  domaine: 'comprendre-mots',
  competence:
    'Comprendre un mot entendu (lexique oral) : associer le mot dit par l’adulte à son image, parmi des images proches.',
  classes: ['CP', 'CE1'],
  niveauxParClasse: { CE1: NIVEAUX_ORAL_CE1 },
  // + : mots très fréquents, autres dessins sans rapport ; ++ : un dessin de la même famille ;
  // +++ : mots rares, tous les dessins de la même famille (des instruments, des animaux…).
  construire: (alea, _classe, niveau): ContenuTexte => {
    const cible = alea.choix(IMAGIER.filter((i) => i.niveau === niveau));
    const autres = autresMots(alea, cible, niveau);
    const dit = avecArticle(cible);
    return {
      enonce: 'Touche « Écouter » : Capy dit un mot.',
      question: 'Quel dessin montre ce mot ?',
      lecture: `${majuscule(dit)}.`,
      reponse: cible.mot,
      distracteurs: autres.map((a) => ({
        valeur: a.mot,
        erreur: a.categorie === cible.categorie ? 'mot de la même famille de sens' : 'autre mot',
      })),
      images: 'imagier',
      indice: 'Redis le mot dans ta tête. Puis cherche son dessin.',
      explication: `Capy a dit « ${dit} ».`,
    };
  },
});

// --- Comprendre des phrases ---

interface Personnage {
  mot: string;
  pluriel: string;
}
/** Ceux qui bougent dans les scènes : tous masculins et commençant par une consonne (le, du, pas de). */
const ANIMAUX: readonly Personnage[] = [
  { mot: 'chat', pluriel: 'chats' },
  { mot: 'chien', pluriel: 'chiens' },
  { mot: 'lapin', pluriel: 'lapins' },
  { mot: 'canard', pluriel: 'canards' },
  { mot: 'cochon', pluriel: 'cochons' },
  { mot: 'mouton', pluriel: 'moutons' },
];

interface Support {
  mot: string;
  /** « la boîte », « le lit », « l’arbre ». */
  le: string;
  /** « de la boîte », « du lit », « de l’arbre ». */
  du: string;
}
const support = (mot: string, le: string, du: string): Support => ({ mot, le, du });
/** On peut être sur ou sous ces objets. */
const DESSUS_DESSOUS: readonly Support[] = [
  support('boîte', 'la boîte', 'de la boîte'),
  support('chaise', 'la chaise', 'de la chaise'),
  support('lit', 'le lit', 'du lit'),
];
/** On peut être à côté de ces objets. */
const A_COTE: readonly Support[] = [
  ...DESSUS_DESSOUS,
  support('maison', 'la maison', 'de la maison'),
  support('arbre', 'l’arbre', 'de l’arbre'),
  support('voiture', 'la voiture', 'de la voiture'),
];

interface Comptable {
  mot: string;
  pluriel: string;
  genre: 'm' | 'f';
}
const COMPTABLES: readonly Comptable[] = [
  { mot: 'pomme', pluriel: 'pommes', genre: 'f' },
  { mot: 'étoile', pluriel: 'étoiles', genre: 'f' },
  { mot: 'fleur', pluriel: 'fleurs', genre: 'f' },
  { mot: 'poisson', pluriel: 'poissons', genre: 'm' },
  { mot: 'ballon', pluriel: 'ballons', genre: 'm' },
];
const NOMBRES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];

type Position = 'sur' | 'sous' | 'gauche' | 'droite';

const el = (objet: string, ligne: number, colonne: number, taille?: 'petit' | 'grand'): ElementScene => ({
  objet,
  ligne,
  colonne,
  ...(taille ? { taille } : {}),
});

/** Le support au milieu, et ce qui est posé dessus, dessous ou sur le côté. */
function scenePosition(objet: string, s: Support, position: Position): Scene {
  const place = { sur: [0, 1], sous: [2, 1], gauche: [1, 0], droite: [1, 2] }[position];
  return [el(s.mot, 1, 1), el(objet, place[0], place[1])];
}

const quantite = (c: Comptable, n: number) =>
  n === 1 ? `${c.genre === 'm' ? 'un' : 'une'} ${c.mot}` : `${NOMBRES[n]} ${c.pluriel}`;

/** Les objets rangés comme on compte : 3 par ligne. */
function sceneQuantite(c: Comptable, n: number): Scene {
  return Array.from({ length: n }, (_, i) => el(c.mot, Math.floor(i / 3) + (n <= 3 ? 1 : 0.5), i % 3));
}

interface Item {
  phrase: string;
  scene: Scene;
}
interface ConstructionPhrase extends Item {
  autres: (Item & { erreur: string })[];
  indice: string;
}

function itemQuantite(alea: Alea, niveau: NiveauDifficulte): ConstructionPhrase {
  const [c, autre] = alea.melanger(COMPTABLES);
  const n = niveau === 1 ? alea.entier(1, 3) : alea.entier(2, 5);
  const dire = (x: Comptable, k: number) => `Il y a ${quantite(x, k)}.`;
  const autres = [
    { phrase: dire(c, n + 1), scene: sceneQuantite(c, n + 1), erreur: 'un de trop' },
    ...(n > 1 ? [{ phrase: dire(c, n - 1), scene: sceneQuantite(c, n - 1), erreur: 'un de moins' }] : []),
    { phrase: dire(autre, n), scene: sceneQuantite(autre, n), erreur: 'autre objet' },
    ...(n === 1 ? [{ phrase: dire(autre, 2), scene: sceneQuantite(autre, 2), erreur: 'autre objet' }] : []),
  ];
  return {
    phrase: dire(c, n),
    scene: sceneQuantite(c, n),
    autres,
    indice: 'Écoute bien combien il y en a, et ce que c’est.',
  };
}

function itemDessusDessous(alea: Alea): ConstructionPhrase {
  const [a, b] = alea.melanger(ANIMAUX);
  const s = alea.choix(DESSUS_DESSOUS);
  const position = alea.choix<Position>(['sur', 'sous']);
  const contraire: Position = position === 'sur' ? 'sous' : 'sur';
  const dire = (p: Personnage, pos: Position) => `Le ${p.mot} est ${pos} ${s.le}.`;
  const cote = alea.choix<Position>(['gauche', 'droite']);
  return {
    phrase: dire(a, position),
    scene: scenePosition(a.mot, s, position),
    autres: [
      {
        phrase: dire(a, contraire),
        scene: scenePosition(a.mot, s, contraire),
        erreur: `${contraire} au lieu de ${position}`,
      },
      { phrase: `Le ${a.mot} est à côté ${s.du}.`, scene: scenePosition(a.mot, s, cote), erreur: 'à côté' },
      { phrase: dire(b, position), scene: scenePosition(b.mot, s, position), erreur: 'autre animal' },
    ],
    indice: 'Écoute bien le petit mot : sur, ou sous ?',
  };
}

function itemGaucheDroite(alea: Alea): ConstructionPhrase {
  const [a, b] = alea.melanger(ANIMAUX);
  const s = alea.choix(A_COTE);
  const cote = alea.choix<'gauche' | 'droite'>(['gauche', 'droite']);
  const autre = cote === 'gauche' ? 'droite' : 'gauche';
  const dire = (p: Personnage, c: string) => `Le ${p.mot} est à ${c} ${s.du}.`;
  return {
    phrase: dire(a, cote),
    scene: scenePosition(a.mot, s, cote),
    autres: [
      { phrase: dire(a, autre), scene: scenePosition(a.mot, s, autre), erreur: 'gauche et droite confondues' },
      { phrase: dire(b, cote), scene: scenePosition(b.mot, s, cote), erreur: 'autre animal' },
      { phrase: dire(b, autre), scene: scenePosition(b.mot, s, autre), erreur: 'autre animal, autre côté' },
    ],
    indice: 'Ta main gauche est du côté où tu commences à écrire.',
  };
}

/** Deux animaux sur (ou sous) le support, côte à côte. */
function scenePluriel(objet: string, s: Support, position: 'sur' | 'sous'): Scene {
  const ligne = position === 'sur' ? 0 : 2;
  return [el(s.mot, 1, 1), el(objet, ligne, 0.5), el(objet, ligne, 1.5)];
}

function itemPluriel(alea: Alea): ConstructionPhrase {
  const [a, b] = alea.melanger(ANIMAUX);
  const s = alea.choix(DESSUS_DESSOUS);
  const position = alea.choix<'sur' | 'sous'>(['sur', 'sous']);
  const contraire = position === 'sur' ? 'sous' : 'sur';
  const dire = (p: Personnage, pos: string) => `Les ${p.pluriel} sont ${pos} ${s.le}.`;
  return {
    phrase: dire(a, position),
    scene: scenePluriel(a.mot, s, position),
    autres: [
      {
        phrase: `Le ${a.mot} est ${position} ${s.le}.`,
        scene: scenePosition(a.mot, s, position),
        erreur: 'un seul au lieu de plusieurs',
      },
      {
        phrase: dire(a, contraire),
        scene: scenePluriel(a.mot, s, contraire),
        erreur: `${contraire} au lieu de ${position}`,
      },
      { phrase: dire(b, position), scene: scenePluriel(b.mot, s, position), erreur: 'autre animal' },
    ],
    indice: 'Écoute bien : « le », c’est un seul. « Les », c’est plusieurs.',
  };
}

function itemTaille(alea: Alea): ConstructionPhrase {
  const [a, b] = alea.melanger(ANIMAUX);
  const scene = (ta: 'petit' | 'grand', tb: 'petit' | 'grand'): Scene => [el(a.mot, 1, 0.5, ta), el(b.mot, 1, 1.5, tb)];
  const dire = (ta: string, tb: string) => `Le ${ta} ${a.mot} est à côté du ${tb} ${b.mot}.`;
  return {
    phrase: dire('grand', 'petit'),
    scene: scene('grand', 'petit'),
    autres: [
      { phrase: dire('petit', 'grand'), scene: scene('petit', 'grand'), erreur: 'tailles inversées' },
      { phrase: dire('grand', 'grand'), scene: scene('grand', 'grand'), erreur: 'tous les deux grands' },
      { phrase: dire('petit', 'petit'), scene: scene('petit', 'petit'), erreur: 'tous les deux petits' },
    ],
    indice: 'Écoute qui est grand, et qui est petit.',
  };
}

function itemNegation(alea: Alea): ConstructionPhrase {
  const [a, b, c] = alea.melanger(ANIMAUX);
  const scene = (x: Personnage, y: Personnage): Scene => [el(x.mot, 1, 0.5), el(y.mot, 1, 1.5)];
  return {
    phrase: `Il y a un ${a.mot}, mais pas de ${b.mot}.`,
    scene: scene(a, c),
    autres: [
      { phrase: `Il y a un ${a.mot} et un ${b.mot}.`, scene: scene(a, b), erreur: 'négation pas entendue' },
      { phrase: `Il y a un ${b.mot} et un ${c.mot}.`, scene: scene(b, c), erreur: 'les deux animaux inversés' },
      { phrase: `Il y a un ${b.mot}.`, scene: [el(b.mot, 1, 1)], erreur: 'seulement l’animal qui ne doit pas y être' },
    ],
    indice: 'Écoute bien : « pas de » veut dire qu’il n’y en a pas.',
  };
}

function itemDeuxInformations(alea: Alea): ConstructionPhrase {
  const [a, b] = alea.melanger(ANIMAUX);
  const s = alea.choix(DESSUS_DESSOUS);
  const scene = (dessus: string, dessous: string, cote = false): Scene => [
    el(s.mot, 1, 1),
    el(dessus, cote ? 1 : 0, cote ? 0 : 1),
    el(dessous, 2, 1),
  ];
  const dire = (x: string, y: string) => `Le ${x} est sur ${s.le}, et le ${y} est dessous.`;
  return {
    phrase: dire(a.mot, b.mot),
    scene: scene(a.mot, b.mot),
    autres: [
      { phrase: dire(b.mot, a.mot), scene: scene(b.mot, a.mot), erreur: 'les deux animaux inversés' },
      {
        phrase: `Le ${a.mot} est sur ${s.le}, et le ${b.mot} est à côté.`,
        scene: [el(s.mot, 1, 1), el(a.mot, 0, 1), el(b.mot, 1, 2)],
        erreur: 'seconde information oubliée',
      },
      {
        phrase: `Le ${a.mot} est à côté ${s.du}, et le ${b.mot} est dessous.`,
        scene: scene(a.mot, b.mot, true),
        erreur: 'première information oubliée',
      },
    ],
    indice: 'Il y a deux choses à retenir. Vérifie les deux.',
  };
}

function itemRelative(alea: Alea): ConstructionPhrase {
  const [a, b] = alea.melanger(ANIMAUX);
  const s = alea.choix(DESSUS_DESSOUS);
  const position = alea.choix<'sur' | 'sous'>(['sur', 'sous']);
  const contraire = position === 'sur' ? 'sous' : 'sur';
  const taille = alea.choix<'petit' | 'grand'>(['petit', 'grand']);
  const autreTaille = taille === 'petit' ? 'grand' : 'petit';
  const scene = (p: Personnage, pos: 'sur' | 'sous', t: 'petit' | 'grand'): Scene => [
    el(s.mot, 1, 1),
    el(p.mot, pos === 'sur' ? 0 : 2, 1, t),
  ];
  const dire = (p: Personnage, pos: string, t: string) => `Le ${p.mot} qui est ${pos} ${s.le} est ${t}.`;
  return {
    phrase: dire(a, position, taille),
    scene: scene(a, position, taille),
    autres: [
      { phrase: dire(a, position, autreTaille), scene: scene(a, position, autreTaille), erreur: 'autre taille' },
      {
        phrase: dire(a, contraire, taille),
        scene: scene(a, contraire, taille),
        erreur: `${contraire} au lieu de ${position}`,
      },
      { phrase: dire(b, position, taille), scene: scene(b, position, taille), erreur: 'autre animal' },
    ],
    indice: 'Écoute bien où il est, puis comment il est.',
  };
}

const ITEMS_PAR_NIVEAU: Record<
  NiveauDifficulte,
  readonly ((alea: Alea, niveau: NiveauDifficulte) => ConstructionPhrase)[]
> = {
  1: [itemQuantite, itemDessusDessous],
  2: [itemQuantite, itemGaucheDroite, itemPluriel, itemTaille],
  3: [itemNegation, itemDeuxInformations, itemRelative, itemPluriel],
};

export const comprendrePhrase = definirModeleTexte({
  id: 'comprendre-phrase',
  titre: 'La bonne image',
  domaine: 'comprendre-phrases',
  competence:
    'Comprendre une phrase entendue : relations dans l’espace, nombre, singulier et pluriel, négation, phrase à deux informations et relative.',
  classes: ['CP', 'CE1'],
  niveauxParClasse: { CE1: NIVEAUX_ORAL_CE1 },
  // + : combien, sur ou sous ; ++ : gauche et droite, un ou plusieurs, grand et petit ;
  // +++ : la négation, deux informations à la fois, la relative.
  construire: (alea, _classe, niveau): ContenuTexte => {
    const item = alea.choix(ITEMS_PAR_NIVEAU[niveau])(alea, niveau);
    const scenes: Record<string, Scene> = { [item.phrase]: item.scene };
    const distracteurs: DistracteurTexte[] = [];
    for (const autre of item.autres) {
      if (scenes[autre.phrase]) continue;
      scenes[autre.phrase] = autre.scene;
      distracteurs.push({ valeur: autre.phrase, erreur: autre.erreur });
    }
    return {
      enonce: 'Touche « Écouter » : Capy dit une phrase.',
      question: 'Quelle image montre ce que dit Capy ?',
      lecture: item.phrase,
      reponse: item.phrase,
      distracteurs,
      images: 'scenes',
      scenes,
      indice: item.indice,
      explication: `Capy a dit « ${item.phrase} »`,
    };
  },
});

/** Toutes les clés d'objets utilisées dans les scènes (le test vérifie qu'elles sont dans l'imagier). */
export const OBJETS_DES_SCENES: readonly string[] = [
  ...ANIMAUX.map((a) => a.mot),
  ...A_COTE.map((s) => s.mot),
  ...COMPTABLES.map((c) => c.mot),
].filter((mot, i, tous) => tous.indexOf(mot) === i);

/** Pour les tests : chaque objet a son dessin. */
export function objetsSansDessin(): string[] {
  return OBJETS_DES_SCENES.filter((mot) => !motImagier(mot));
}
