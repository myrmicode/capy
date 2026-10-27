/**
 * Atelier « Les formes » (géométrie, hors toile) : reconnaître et nommer une
 * figure, compter ses côtés, trouver ses axes de symétrie. La figure est
 * dessinée dans l'énoncé.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import type { Alea } from '../alea';
import { definirModeleTexte } from '../francais/moteur';
import { COTES, type Forme } from '../types';

const NOMS: Record<Forme, string> = {
  carre: 'carré',
  rectangle: 'rectangle',
  triangle: 'triangle',
  cercle: 'cercle',
  losange: 'losange',
  pentagone: 'pentagone',
  hexagone: 'hexagone',
  octogone: 'octogone',
  trapeze: 'trapèze',
  coeur: 'cœur',
};

/** Figures qu'on confond facilement : les pièges des niveaux plus exigeants. */
const CONFUSIONS: Partial<Record<Forme, Forme[]>> = {
  carre: ['losange', 'rectangle'],
  rectangle: ['carre', 'trapeze'],
  losange: ['carre', 'rectangle'],
  triangle: ['trapeze', 'losange'],
  cercle: ['octogone', 'hexagone'],
  pentagone: ['hexagone', 'octogone'],
  hexagone: ['pentagone', 'octogone'],
  octogone: ['hexagone', 'pentagone'],
  trapeze: ['rectangle', 'losange'],
};

const PAR_NIVEAU: Record<1 | 2 | 3, Forme[]> = {
  1: ['carre', 'rectangle', 'triangle', 'cercle'],
  2: ['carre', 'rectangle', 'triangle', 'cercle', 'losange', 'trapeze'],
  3: ['carre', 'rectangle', 'triangle', 'cercle', 'losange', 'trapeze', 'pentagone', 'hexagone', 'octogone'],
};

const PRESENTATIONS = ['Capy a dessiné une figure.', 'Voici une figure de Lina.', 'Noé a tracé cette figure.'];

export const reconnaitreFigure = definirModeleTexte({
  id: 'reconnaitre-figure',
  titre: 'Le nom des figures',
  domaine: 'geometrie',
  competence: 'Reconnaître et nommer les figures usuelles : carré, rectangle, triangle, cercle, losange, polygones.',
  classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  // + : carré, rectangle, triangle, cercle ; ++ : aussi losange et trapèze ; +++ : aussi les polygones.
  construire: (alea, _classe, niveau) => {
    const forme = alea.choix(PAR_NIVEAU[niveau]);
    const pieges = niveau === 1 ? [] : (CONFUSIONS[forme] ?? []);
    const autres = alea.melanger(PAR_NIVEAU[niveau].filter((f) => f !== forme && !pieges.includes(f)));
    return {
      enonce: alea.choix(PRESENTATIONS),
      question: 'Comment s’appelle cette figure\u00a0?',
      illustration: { type: 'figure', forme },
      reponse: NOMS[forme],
      distracteurs: [...pieges, ...autres].slice(0, 3).map((f) => ({
        valeur: NOMS[f],
        erreur: pieges.includes(f) ? 'figure qui se ressemble' : 'autre figure',
      })),
      indice: 'Compte les côtés, puis regarde s’ils sont tous pareils et si les coins sont droits.',
      explication: `C’est un ${NOMS[forme]}. ${DESCRIPTIONS[forme]}`,
      facile: {
        indice: 'Compte les côtés. Regarde les coins.',
      },
    };
  },
});

const DESCRIPTIONS: Record<Forme, string> = {
  carre: 'Il a 4 côtés de même longueur et 4 angles droits.',
  rectangle: 'Il a 4 angles droits. Ses côtés opposés ont la même longueur.',
  triangle: 'Il a 3 côtés.',
  cercle: 'Il est tout rond, sans aucun côté droit.',
  losange: 'Il a 4 côtés de même longueur, mais pas d’angle droit.',
  pentagone: 'Il a 5 côtés.',
  hexagone: 'Il a 6 côtés.',
  octogone: 'Il a 8 côtés.',
  trapeze: 'Il a 4 côtés, dont deux seulement sont parallèles.',
  coeur: 'Il a la forme d’un cœur.',
};

const POLYGONES: Forme[] = [
  'triangle',
  'carre',
  'rectangle',
  'losange',
  'trapeze',
  'pentagone',
  'hexagone',
  'octogone',
];

function distracteursNombre(alea: Alea, n: number, erreurs: [number, string][]) {
  return alea.melanger(
    erreurs.filter(([v]) => v >= 0 && v !== n).map(([v, erreur]) => ({ valeur: String(v), erreur })),
  );
}

export const compterCotes = definirModeleTexte({
  id: 'compter-cotes',
  titre: 'Les côtés et les sommets',
  domaine: 'geometrie',
  competence: 'Compter les côtés et les sommets d’un polygone.',
  classes: ['CP', 'CE1', 'CE2'],
  // + : triangles et quadrilatères ; ++ : aussi le pentagone ; +++ : aussi l'hexagone et l'octogone.
  construire: (alea, _classe, niveau) => {
    const formes = POLYGONES.filter((f) => COTES[f] <= (niveau === 1 ? 4 : niveau === 2 ? 5 : 8));
    const forme = alea.choix(formes);
    const n = COTES[forme];
    const sommets = alea.choix([true, false]);
    const quoi = sommets ? 'sommets' : 'côtés';
    return {
      enonce: alea.choix(PRESENTATIONS),
      question: `Combien de ${quoi} a cette figure\u00a0?`,
      illustration: { type: 'figure', forme },
      reponse: String(n),
      distracteurs: distracteursNombre(alea, n, [
        [n - 1, `un ${sommets ? 'sommet' : 'côté'} oublié`],
        [n + 1, `un ${sommets ? 'sommet' : 'côté'} compté deux fois`],
        [n * 2, 'côtés et sommets comptés ensemble'],
        [n - 2, 'deux oubliés'],
      ]),
      indice: sommets
        ? 'Un sommet, c’est un coin. Pose ton doigt sur un coin, puis fais le tour en comptant.'
        : 'Pose ton doigt sur un côté, puis fais le tour de la figure en comptant chaque côté une fois.',
      explication: `Le ${NOMS[forme]} a ${n} ${quoi}\u00a0: autant de côtés que de sommets.`,
      facile: { indice: sommets ? 'Un sommet, c’est un coin. Fais le tour.' : 'Fais le tour en comptant.' },
    };
  },
});

/** Axes de symétrie de chaque figure (les polygones sont réguliers, le trapèze est isocèle). */
const AXES: Partial<Record<Forme, number>> = {
  carre: 4,
  rectangle: 2,
  triangle: 3,
  losange: 2,
  pentagone: 5,
  hexagone: 6,
  octogone: 8,
  trapeze: 1,
  coeur: 1,
};

export const axesSymetrie = definirModeleTexte({
  id: 'axes-symetrie',
  titre: 'Les axes de symétrie',
  domaine: 'geometrie',
  competence: 'Trouver les axes de symétrie d’une figure : la ligne de pliage qui fait se superposer les deux moitiés.',
  classes: ['CE2', 'CM1', 'CM2'],
  // + : un ou deux axes ; ++ : jusqu'à quatre ; +++ : aussi les polygones réguliers.
  construire: (alea, _classe, niveau) => {
    const max = niveau === 1 ? 2 : niveau === 2 ? 4 : 8;
    const forme = alea.choix((Object.keys(AXES) as Forme[]).filter((f) => AXES[f]! <= max));
    const n = AXES[forme]!;
    return {
      enonce: alea.choix(PRESENTATIONS),
      question: 'Combien d’axes de symétrie a cette figure\u00a0?',
      illustration: { type: 'figure', forme },
      reponse: String(n),
      distracteurs: distracteursNombre(alea, n, [
        [
          n === 2 ? 4 : n === 4 ? 2 : n + 1,
          forme === 'rectangle' ? 'diagonales prises pour des axes' : 'un axe en trop',
        ],
        [n - 1, 'un axe oublié'],
        [n * 2, 'chaque axe compté deux fois'],
        [n + 2, 'deux axes en trop'],
      ]),
      indice:
        'Imagine que tu plies la figure\u00a0: les deux moitiés doivent se superposer exactement. Essaie chaque pliage.',
      explication: `Le ${NOMS[forme]} a ${n} axe${n > 1 ? 's' : ''} de symétrie\u00a0: ${n === 1 ? 'un seul pliage fait' : `${n} pliages font`} se superposer ses deux moitiés.`,
      facile: { indice: 'Imagine que tu plies la figure en deux.' },
    };
  },
});
