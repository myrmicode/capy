import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';

import type { Alea } from './alea';

export type Operation = '+' | '−' | '×' | '÷';

/**
 * Niveau de difficulté d'un exercice, calé sur les symboles de la fiche :
 * 1 = « + » (accessible), 2 = « ++ », 3 = « +++ », le niveau attendu en fin d'année.
 */
export type NiveauDifficulte = 1 | 2 | 3;
export const NIVEAUX: readonly NiveauDifficulte[] = [1, 2, 3];
/** Le niveau visé : on y emmène l'enfant pas à pas. */
export const NIVEAU_CIBLE: NiveauDifficulte = 3;

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

/** Exercice dont la réponse est un nombre (mathématiques). */
export interface Exercice {
  nature: 'nombre';
  modeleId: string;
  niveau: NiveauDifficulte;
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
  /**
   * Pour « La question perdue » : la bonne question et des questions auxquelles
   * l'histoire ne permet pas de répondre, mélangées de façon reproductible.
   */
  questionsAuChoix?: string[];
}

/** Ce qu'on écrit pour créer un modèle (voir `modeles/`). */
export interface DefinitionModele<D extends Donnees> {
  id: string;
  titre: string;
  domaine: DomaineId;
  /** Compétence visée, formulée d'après les attendus officiels (relecture par un enseignant). */
  competence: string;
  operations: Operation[];
  /** Règles du niveau visé (+++), par classe. */
  regles: Partial<Record<Classe, ReglesClasse<D>>>;
  /**
   * Règles plus accessibles pour les niveaux 1 (+) et 2 (++). Un niveau absent
   * reprend les règles du niveau visé.
   */
  reglesAccessibles?: Partial<Record<Classe, Partial<Record<1 | 2, ReglesClasse<D>>>>>;
  /** Contraintes entre les nombres (ex. « on ne retire pas plus qu'il n'y a »). */
  estValide?: (d: D) => boolean;
  /** Tirage personnalisé ; par défaut chaque nombre est tiré uniformément dans ses bornes. */
  tirer?: (alea: Alea, regles: ReglesClasse<D>, niveau: NiveauDifficulte) => D;
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
) => {
  enonce: string;
  question: string;
  indice: string;
  explication: string;
  /** Questions qui semblent aller avec l'histoire mais auxquelles ses nombres ne permettent pas de répondre. */
  autresQuestions?: readonly string[];
};

export interface OptionsGeneration {
  /** Variante d'histoire imposée (index dans « histoires »). */
  histoire?: number;
  /** Niveau de difficulté (le niveau visé si absent). */
  niveau?: NiveauDifficulte;
}

/** Modèle prêt à l'emploi, tel que l'utilisent le parcours et les mini-jeux. */
export interface ModeleExercice {
  id: string;
  titre: string;
  domaine: DomaineId;
  competence: string;
  operations: Operation[];
  classes: Classe[];
  regles: (classe: Classe, niveau?: NiveauDifficulte) => ReglesClasse<Donnees>;
  /** `histoire` impose une variante d'histoire (index dans `histoires`), utile pour un mini-jeu illustré. */
  generer: (classe: Classe, graine: number, options?: OptionsGeneration) => Exercice;
}

// --- Exercices dont la réponse est un mot ou un groupe de mots (français) ---

/** Morceau de phrase affiché (un mot ou un groupe), que l'enfant peut toucher. */
export interface Segment {
  texte: string;
  /** Mis en valeur dans la phrase (mot dont on demande la nature). */
  surligne?: boolean;
}

export interface DistracteurTexte {
  valeur: string;
  erreur: string;
}

export interface ExerciceTexte {
  nature: 'texte';
  modeleId: string;
  niveau: NiveauDifficulte;
  domaine: DomaineId;
  classe: Classe;
  graine: number;
  /** Phrase ou mot présenté à l'enfant. */
  enonce: string;
  question: string;
  reponse: string;
  distracteurs: DistracteurTexte[];
  /** Bonne réponse et distracteurs, mélangés de façon reproductible. */
  choix: string[];
  /** Phrase découpée, pour les jeux où l'on touche un mot ou un groupe. */
  segments?: Segment[];
  /** Catégories proposées (jeu des paniers), dans un ordre fixe. */
  categories?: string[];
  /**
   * Texte que Capy dit à voix haute à la place de l'énoncé. Pour une dictée, le
   * mot est dit mais jamais affiché : l'énoncé montre la phrase avec un trou.
   */
  lecture?: string;
  /** Texte découpé en phrases que l'enfant peut toucher (jeu « La bonne phrase »). */
  phrases?: string[];
  /**
   * L'enfant lit seul : c'est la compétence travaillée. « Écouter » ne lit alors
   * que la consigne et la question, jamais le texte.
   */
  lectureAutonome?: boolean;
  indice: string;
  explication: string;
}

export type ExerciceQuelconque = Exercice | ExerciceTexte;

/** Modèle d'exercice de français, tel que l'utilisent le parcours et les mini-jeux. */
export interface ModeleTexte {
  id: string;
  titre: string;
  domaine: DomaineId;
  competence: string;
  classes: Classe[];
  generer: (classe: Classe, graine: number, options?: OptionsGeneration) => ExerciceTexte;
}

export type ModeleQuelconque = ModeleExercice | ModeleTexte;
