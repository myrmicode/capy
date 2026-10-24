import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';

import type { Alea } from './alea';

export type Operation = '+' | '−' | '×' | '÷';

export interface Intervalle {
  min: number;
  max: number;
}

/** Les nombres qui apparaissent dans l'histoire, par nom. */
export type Donnees = Record<string, number>;

/** Mauvaise réponse proposée, issue d'une erreur typique. */
export interface Distracteur {
  valeur: number;
  /** Erreur d'élève que ce distracteur représente (pour un enseignant ou un retour ciblé). */
  erreur: string;
}

/** Règles d'un modèle pour une classe : bornes de chaque nombre de l'histoire et de la réponse. */
export interface ReglesClasse<D extends Donnees> {
  donnees: { [K in keyof D]: Intervalle };
  reponse: Intervalle;
}

export interface Exercice {
  modeleId: string;
  domaine: DomaineId;
  classe: Classe;
  graine: number;
  donnees: Donnees;
  /** L'histoire, sans la question. */
  enonce: string;
  question: string;
  reponse: number;
  /** Opérations à effectuer, dans l'ordre (une seule pour un problème en une étape). */
  operations: Operation[];
  distracteurs: Distracteur[];
  /** Bonne réponse et distracteurs, mélangés de façon reproductible. */
  choix: number[];
  /** Guide l'enfant sans donner la réponse. */
  indice: string;
  /** Explication de la méthode, affichée dans le panneau Bravo / Presque. */
  explication: string;
}

/** Ce qu'on écrit pour créer un modèle (voir `modeles/`). */
export interface DefinitionModele<D extends Donnees> {
  id: string;
  titre: string;
  domaine: DomaineId;
  /** Compétence visée, formulée d'après les attendus officiels (relecture par un enseignant). */
  competence: string;
  operations: Operation[];
  regles: Partial<Record<Classe, ReglesClasse<D>>>;
  /** Contraintes entre les nombres (ex. « on ne retire pas plus qu'il n'y a »). */
  estValide?: (d: D) => boolean;
  /** Tirage personnalisé ; par défaut chaque nombre est tiré uniformément dans ses bornes. */
  tirer?: (alea: Alea, regles: ReglesClasse<D>) => D;
  /** La réponse est toujours calculée, jamais écrite à la main. */
  calculer: (d: D) => number;
  /** Variantes d'histoire ; l'une d'elles est choisie au hasard. */
  histoires: readonly Histoire<D>[];
  erreursTypiques: (d: D) => Distracteur[];
}

/** Une variante d'histoire avec son indice et son explication, adaptés au contexte. */
export type Histoire<D extends Donnees> = (
  d: D,
  reponse: number,
) => { enonce: string; question: string; indice: string; explication: string };

/** Modèle prêt à l'emploi, tel que l'utilisent le parcours et les mini-jeux. */
export interface ModeleExercice {
  id: string;
  titre: string;
  domaine: DomaineId;
  competence: string;
  operations: Operation[];
  classes: Classe[];
  regles: (classe: Classe) => ReglesClasse<Donnees>;
  generer: (classe: Classe, graine: number) => Exercice;
}
