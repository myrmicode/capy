// Poser une opération en colonnes : la grille du brouillon (addition,
// soustraction, multiplication avec ses lignes intermédiaires) et la
// vérification case par case. Fonctions pures, testées.
//
// La vérification porte sur le calcul posé par l'enfant, jamais sur le choix de
// l'opération : dans un problème, c'est à lui de trouver quoi calculer.
import type { Exercice, Operation } from './types';

export type OperationPosee = '+' | '−' | '×';
export const OPERATIONS_POSEES: readonly OperationPosee[] = ['+', '−', '×'];

/** Au-delà, la grille ne tient plus sur un téléphone. */
export const CHIFFRES_MAX = 7;
/** On multiplie par un nombre de 3 chiffres au plus (3 lignes intermédiaires). */
export const CHIFFRES_MULTIPLICATEUR_MAX = 3;

/** Une ligne à remplir : ses chiffres attendus, de gauche à droite, alignés sur la droite de la grille. */
export interface LigneAttendue {
  /** Chiffres attendus (sans zéros à gauche). */
  chiffres: string;
  /** Zéros de décalage, déjà écrits à droite (multiplication par les dizaines, les centaines). */
  decalage: number;
}

export interface GrillePose {
  operation: OperationPosee;
  a: number;
  b: number;
  /** Nombre de colonnes de chiffres (le signe a sa propre colonne, à gauche). */
  colonnes: number;
  /** Lignes intermédiaires de la multiplication (vide si le multiplicateur n'a qu'un chiffre). */
  partiels: LigneAttendue[];
  resultat: LigneAttendue;
}

export type ProblemePose = 'vide' | 'trop-grand' | 'soustraction-impossible' | 'multiplicateur-trop-long';

export function calculer(operation: OperationPosee, a: number, b: number): number {
  return operation === '+' ? a + b : operation === '−' ? a - b : a * b;
}

/** Ce qui empêche de poser l'opération (null si on peut la poser). */
export function problemePose(operation: OperationPosee, a: number, b: number): ProblemePose | null {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return 'vide';
  if (operation === '−' && b > a) return 'soustraction-impossible';
  if (operation === '×' && String(b).length > CHIFFRES_MULTIPLICATEUR_MAX) return 'multiplicateur-trop-long';
  if (String(calculer(operation, a, b)).length > CHIFFRES_MAX || String(Math.max(a, b)).length > CHIFFRES_MAX)
    return 'trop-grand';
  return null;
}

export function grillePose(operation: OperationPosee, a: number, b: number): GrillePose {
  const resultat = calculer(operation, a, b);
  const chiffresB = String(b);
  const partiels =
    operation === '×' && chiffresB.length > 1
      ? [...chiffresB].reverse().map((c, rang) => ({ chiffres: String(a * Number(c)), decalage: rang }))
      : [];
  const largeurs = [
    String(a).length,
    chiffresB.length,
    String(resultat).length,
    ...partiels.map((p) => p.chiffres.length + p.decalage),
  ];
  return {
    operation,
    a,
    b,
    colonnes: Math.max(...largeurs),
    partiels,
    resultat: { chiffres: String(resultat), decalage: 0 },
  };
}

/**
 * Une ligne saisie, colonne par colonne de gauche à droite ('' pour une case vide),
 * comparée à la ligne attendue. Les cases vides à gauche du nombre sont justes ;
 * les zéros de décalage ne se saisissent pas.
 */
export function verifierLigne(saisie: readonly string[], attendue: LigneAttendue, colonnes: number): boolean[] {
  const attendu = attendue.chiffres.padStart(colonnes - attendue.decalage, ' ');
  return Array.from({ length: colonnes - attendue.decalage }, (_, i) => {
    const voulu = attendu[i] === ' ' ? '' : attendu[i];
    const ecrit = saisie[i] ?? '';
    // Un zéro écrit à gauche du nombre ne change rien.
    return ecrit === voulu || (voulu === '' && ecrit === '0' && saisie.slice(0, i).every((c) => c === '' || c === '0'));
  });
}

/** Une ligne est complète si chaque chiffre attendu a été écrit. */
export function ligneRemplie(saisie: readonly string[], attendue: LigneAttendue, colonnes: number): boolean {
  const debut = colonnes - attendue.decalage - attendue.chiffres.length;
  return saisie.slice(debut, colonnes - attendue.decalage).every((c) => c !== '');
}

/** Le nom de la colonne, pour le lecteur d'écran : « unités », « dizaines »… */
export function nomColonne(colonnes: number, i: number): string {
  const rang = colonnes - 1 - i;
  return (
    ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille', 'millions'][
      rang
    ] ?? `rang ${rang + 1}`
  );
}

/**
 * Pour un exercice « Poser et calculer », l'opération est donnée : le brouillon
 * s'ouvre déjà posé. Pour un problème, l'enfant choisit lui-même.
 */
export function poseDonnee(ex: Exercice): { operation: OperationPosee; a: number; b: number } | null {
  if (ex.domaine !== 'poser-calculer' || ex.operations.length !== 1) return null;
  const op: Operation = ex.operations[0];
  const { a, b } = ex.donnees;
  if (op === '÷' || a === undefined || b === undefined) return null;
  return problemePose(op, a, b) === null ? { operation: op, a, b } : null;
}
