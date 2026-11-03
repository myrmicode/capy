/**
 * Lire des données (CE1 à CM2), comme dans les évaluations : un tableau ou un
 * diagramme en barres gradué, puis une question. On lit une valeur, on trouve
 * le plus ou le moins, puis on combine deux valeurs (écart, total).
 * Les barres n'ont pas leur nombre écrit : on le lit sur l'axe gradué, parfois
 * entre deux graduations (CM).
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import type { Classe } from '@/config/classes';

import type { Alea } from '../alea';
import { definirModeleTexte, majuscule } from '../francais/moteur';
import { nb } from '../moteur';
import type { DistracteurTexte, IllustrationGraphique, NiveauDifficulte } from '../types';

interface Nom {
  /** Comme on l'écrit sous la barre et dans la réponse (« les pommes », « Léa »). */
  avec: string;
  /** Sans article, pour « combien de poules » (le même que `avec` pour un prénom ou un jour). */
  sans: string;
}

interface Contexte {
  titre: string;
  unite: string;
  /** Ce qu'on compte, au pluriel (« élèves ») : « 12 élèves ». */
  compte: string;
  noms: readonly Nom[];
  /** Plus grande valeur qui a du sens (31 jours de pluie au plus). */
  max: number;
  lire: (n: Nom) => string;
  plus: string;
  moins: string;
  ecart: (a: Nom, b: Nom) => string;
  total: (a: Nom, b: Nom) => string;
}

const meme = (mot: string): Nom => ({ avec: mot, sans: mot });
const les = (mot: string): Nom => ({ avec: `les ${mot}`, sans: mot });

const CONTEXTES: readonly Contexte[] = [
  {
    titre: 'Les fruits préférés de la classe',
    unite: 'Nombre d’élèves',
    compte: 'élèves',
    noms: ['pommes', 'bananes', 'fraises', 'cerises', 'poires'].map(les),
    max: 30,
    lire: (n) => `Combien d’élèves préfèrent ${n.avec} ?`,
    plus: 'Quel fruit est choisi par le plus d’élèves ?',
    moins: 'Quel fruit est choisi par le moins d’élèves ?',
    ecart: (a, b) => `Combien d’élèves de plus ont choisi ${a.avec} plutôt que ${b.avec} ?`,
    total: (a, b) => `Combien d’élèves ont choisi ${a.avec} ou ${b.avec} ?`,
  },
  {
    titre: 'Les livres lus ce mois-ci',
    unite: 'Nombre de livres',
    compte: 'livres',
    noms: ['Léa', 'Noé', 'Inès', 'Tom', 'Sami'].map(meme),
    max: 20,
    lire: (n) => `Combien de livres a lus ${n.avec} ?`,
    plus: 'Qui a lu le plus de livres ?',
    moins: 'Qui a lu le moins de livres ?',
    ecart: (a, b) => `${a.avec} a lu plus de livres que ${b.avec}. Combien de plus ?`,
    total: (a, b) => `Combien de livres ont lus ${a.avec} et ${b.avec} en tout ?`,
  },
  {
    titre: 'Les animaux de la ferme',
    unite: 'Nombre d’animaux',
    compte: 'animaux',
    noms: ['poules', 'vaches', 'lapins', 'moutons', 'canards'].map(les),
    max: 100,
    lire: (n) => `Combien de ${n.sans} y a-t-il à la ferme ?`,
    plus: 'Quels animaux sont les plus nombreux ?',
    moins: 'Quels animaux sont les moins nombreux ?',
    ecart: (a, b) => `Combien y a-t-il de ${a.sans} de plus que de ${b.sans} ?`,
    total: (a, b) => `Combien y a-t-il de ${a.sans} et de ${b.sans} en tout ?`,
  },
  {
    titre: 'Les jours de pluie',
    unite: 'Nombre de jours',
    compte: 'jours',
    noms: ['janvier', 'février', 'mars', 'avril', 'mai'].map(meme),
    max: 31,
    lire: (n) => `Combien de jours de pluie y a-t-il eu en ${n.avec} ?`,
    plus: 'Quel mois a eu le plus de jours de pluie ?',
    moins: 'Quel mois a eu le moins de jours de pluie ?',
    ecart: (a, b) => `Combien de jours de pluie de plus en ${a.avec} qu’en ${b.avec} ?`,
    total: (a, b) => `Combien de jours de pluie en ${a.avec} et en ${b.avec} en tout ?`,
  },
  {
    titre: 'Les visiteurs du musée',
    unite: 'Nombre de visiteurs',
    compte: 'visiteurs',
    noms: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'].map(meme),
    max: 1000,
    lire: (n) => `Combien de visiteurs sont venus ${n.avec} ?`,
    plus: 'Quel jour est-il venu le plus de visiteurs ?',
    moins: 'Quel jour est-il venu le moins de visiteurs ?',
    ecart: (a, b) => `Combien de visiteurs de plus sont venus ${a.avec} que ${b.avec} ?`,
    total: (a, b) => `Combien de visiteurs sont venus ${a.avec} et ${b.avec} en tout ?`,
  },
];

/** Écarts possibles entre deux graduations de l'axe, par classe : l'axe compte au plus 10 graduations. */
const PAS: Record<Classe, readonly number[]> = {
  CP: [1],
  CE1: [1, 2],
  CE2: [2, 5],
  CM1: [5, 10],
  CM2: [10, 20, 50],
};
const GRADUATIONS = 10;

type Question = 'lire' | 'plus' | 'moins' | 'ecart' | 'total';

/** + : lire une valeur ; ++ : aussi le plus et le moins ; +++ : aussi l'écart et le total. */
const QUESTIONS: Record<NiveauDifficulte, readonly Question[]> = {
  1: ['lire'],
  2: ['lire', 'plus', 'moins'],
  3: ['ecart', 'total', 'lire', 'plus'],
};

/** Des valeurs toutes différentes, sur les graduations (ou entre deux, au CM, niveau +++). */
function tirerValeurs(alea: Alea, combien: number, pas: number, max: number, entreDeux: boolean): number[] | null {
  const unite = entreDeux ? pas / 2 : pas;
  const plafond = Math.min(max, pas * GRADUATIONS);
  const possibles = Array.from({ length: Math.floor(plafond / unite) }, (_, i) => (i + 1) * unite);
  if (possibles.length < combien) return null;
  const valeurs = alea.melanger(possibles).slice(0, combien);
  // Au CM, niveau +++, au moins une barre s'arrête entre deux graduations.
  if (entreDeux && valeurs.every((v) => v % pas === 0)) return null;
  return valeurs;
}

export const lireGraphique = definirModeleTexte({
  id: 'lire-graphique',
  titre: 'Tableaux et graphiques',
  domaine: 'resoudre-problemes',
  competence:
    'Lire et exploiter des données dans un tableau ou un diagramme en barres : lire une valeur, comparer, calculer un écart ou un total.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  construire: (alea, classe, niveau) => {
    const pas = alea.choix(PAS[classe]);
    // Assez de place sur l'axe pour cinq barres différentes.
    const contexte = alea.choix(CONTEXTES.filter((c) => c.max >= pas * 5));
    // Le tableau au niveau + (et parfois ensuite) ; le diagramme le reste du temps.
    const forme = alea.entier(0, niveau === 1 ? 1 : 3) === 0 ? 'tableau' : 'barres';
    const entreDeux = forme === 'barres' && niveau === 3 && pas % 2 === 0 && (classe === 'CM1' || classe === 'CM2');
    const combien = niveau === 1 ? 3 : alea.entier(4, 5);
    const valeurs = tirerValeurs(alea, combien, pas, contexte.max, entreDeux);
    if (!valeurs) return null;
    const noms = alea.melanger(contexte.noms).slice(0, combien);
    const lignes = noms.map((n, i) => ({ nom: n.avec, valeur: valeurs[i] }));
    const illustration: IllustrationGraphique = {
      type: 'graphique',
      forme,
      titre: contexte.titre,
      unite: contexte.unite,
      lignes,
      pas,
    };
    const enonce =
      forme === 'tableau'
        ? `Voici un tableau : ${contexte.titre.toLowerCase()}.`
        : `Voici un diagramme en barres : ${contexte.titre.toLowerCase()}.`;
    const lire =
      forme === 'tableau'
        ? 'Cherche la bonne ligne, puis lis le nombre en face.'
        : 'Suis le haut de la barre jusqu’à l’axe des nombres.';
    const lireFacile =
      forme === 'tableau' ? 'Cherche la ligne. Lis le nombre en face.' : 'Suis le haut de la barre jusqu’aux nombres.';
    const barre = (i: number) => (forme === 'tableau' ? `En face de ${lignes[i].nom}` : `Pour ${lignes[i].nom}`);
    const type = alea.choix(QUESTIONS[niveau]);
    const commun = { enonce, illustration };

    if (type === 'lire') {
      const i = alea.entier(0, combien - 1);
      const v = valeurs[i];
      const voisins = [valeurs[i - 1], valeurs[i + 1]].filter((x) => x !== undefined);
      const distracteurs: DistracteurTexte[] = [
        ...voisins.map((x) => ({ valeur: nb(x), erreur: 'valeur de la barre ou de la ligne d’à côté' })),
        { valeur: nb(v + pas), erreur: 'graduation du dessus' },
        ...(v - pas > 0 ? [{ valeur: nb(v - pas), erreur: 'graduation du dessous' }] : []),
      ];
      const entre = forme === 'barres' && v % pas !== 0;
      return {
        ...commun,
        question: contexte.lire(noms[i]),
        reponse: nb(v),
        distracteurs: alea.melanger(distracteurs),
        indice: entre ? 'La barre s’arrête entre deux graduations : cherche le nombre du milieu.' : lire,
        explication: `${barre(i)}, on lit ${nb(v)} : ${nb(v)} ${contexte.compte}.`,
        facile: {
          indice: entre ? 'La barre s’arrête au milieu de deux nombres.' : lireFacile,
          explication: `${barre(i)}, on lit ${nb(v)}.`,
        },
      };
    }

    if (type === 'plus' || type === 'moins') {
      const ordre = [...lignes].sort((a, b) => (type === 'plus' ? b.valeur - a.valeur : a.valeur - b.valeur));
      const bonne = ordre[0];
      return {
        ...commun,
        question: type === 'plus' ? contexte.plus : contexte.moins,
        reponse: bonne.nom,
        distracteurs: [
          {
            valeur: ordre[ordre.length - 1].nom,
            erreur: type === 'plus' ? 'le moins à la place du plus' : 'le plus à la place du moins',
          },
          { valeur: ordre[1].nom, erreur: 'barre presque pareille' },
          ...alea.melanger(ordre.slice(2, -1)).map((l) => ({ valeur: l.nom, erreur: 'autre barre' })),
        ],
        indice:
          forme === 'tableau'
            ? `Compare tous les nombres du tableau, puis cherche le plus ${type === 'plus' ? 'grand' : 'petit'}.`
            : `Compare la hauteur des barres : cherche la plus ${type === 'plus' ? 'haute' : 'basse'}.`,
        explication: `${majuscule(bonne.nom)} : ${nb(bonne.valeur)} ${contexte.compte}. C’est le plus ${type === 'plus' ? 'grand' : 'petit'} nombre.`,
        facile: {
          indice:
            forme === 'tableau'
              ? 'Compare les nombres.'
              : `Cherche la barre la plus ${type === 'plus' ? 'haute' : 'basse'}.`,
          explication: `${majuscule(bonne.nom)} : ${nb(bonne.valeur)}. C’est le plus ${type === 'plus' ? 'grand' : 'petit'}.`,
        },
      };
    }

    // Deux valeurs : la plus grande d'abord, pour que l'écart reste positif.
    const [i, j] = alea.melanger(Array.from({ length: combien }, (_, k) => k)).slice(0, 2);
    const [a, b] = valeurs[i] > valeurs[j] ? [i, j] : [j, i];
    const va = valeurs[a];
    const vb = valeurs[b];
    if (type === 'ecart') {
      const r = va - vb;
      return {
        ...commun,
        question: contexte.ecart(noms[a], noms[b]),
        reponse: nb(r),
        distracteurs: alea.melanger([
          { valeur: nb(va + vb), erreur: 'addition au lieu de l’écart' },
          { valeur: nb(va), erreur: 'une seule valeur lue' },
          { valeur: nb(vb), erreur: 'une seule valeur lue' },
          { valeur: nb(r + pas), erreur: 'une graduation de trop' },
        ]),
        indice: 'Lis les deux nombres, puis cherche l’écart entre eux.',
        explication: `On lit ${nb(va)} et ${nb(vb)}. ${nb(va)} − ${nb(vb)} = ${nb(r)} : ${nb(r)} ${contexte.compte} de plus.`,
        facile: {
          indice: 'Lis les deux nombres. Cherche l’écart.',
          explication: `On lit ${nb(va)} et ${nb(vb)}. ${nb(va)} − ${nb(vb)} = ${nb(r)}.`,
        },
      };
    }
    const r = va + vb;
    return {
      ...commun,
      question: contexte.total(noms[a], noms[b]),
      reponse: nb(r),
      distracteurs: alea.melanger([
        { valeur: nb(va - vb), erreur: 'écart au lieu du total' },
        { valeur: nb(va), erreur: 'une seule valeur lue' },
        { valeur: nb(vb), erreur: 'une seule valeur lue' },
        { valeur: nb(r + pas), erreur: 'une graduation de trop' },
      ]),
      indice: 'Lis les deux nombres, puis ajoute-les.',
      explication: `On lit ${nb(va)} et ${nb(vb)}. ${nb(va)} + ${nb(vb)} = ${nb(r)} : ${nb(r)} ${contexte.compte} en tout.`,
      facile: {
        indice: 'Lis les deux nombres. Ajoute-les.',
        explication: `On lit ${nb(va)} et ${nb(vb)}. ${nb(va)} + ${nb(vb)} = ${nb(r)}.`,
      },
    };
  },
});
