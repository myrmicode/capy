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

/**
 * Version FALC (Facile à lire et à comprendre) : phrases courtes, une idée par
 * phrase, mots simples. Affichée avec le réglage « Consignes en FALC ».
 * En français, l'énoncé est la phrase étudiée : il reste le même.
 */
export interface VersionFacile {
  enonce: string;
  question: string;
  indice: string;
  explication: string;
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
  facile: VersionFacile;
  /**
   * Pour « La question perdue » : la bonne question et des questions auxquelles
   * l'histoire ne permet pas de répondre, mélangées de façon reproductible.
   */
  questionsAuChoix?: string[];
  /** Texte dit par Capy, jamais écrit (dictée de nombres). */
  lecture?: string;
  illustration?: Illustration;
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
  tirer?: (alea: Alea, regles: ReglesClasse<D>, niveau: NiveauDifficulte, classe: Classe) => D;
  /** La réponse est toujours calculée, jamais écrite à la main. */
  calculer: (d: D) => number;
  /** Variantes d'histoire ; l'une d'elles est choisie au hasard. */
  histoires: readonly Histoire<D>[];
  /**
   * Histoires propres à une classe, à la place des autres (en CM, des contextes
   * où les grands nombres ont du sens : habitants, kilomètres, spectateurs).
   */
  histoiresParClasse?: Partial<Record<Classe, readonly Histoire<D>[]>>;
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
  /** Texte dit par Capy, jamais écrit (dictée de nombres). */
  lecture?: string;
  /** Objets dessinés dans l'énoncé (compter des objets) : le nombre est dans le dessin, pas dans le texte. */
  illustration?: Illustration;
  facile: VersionFacile;
};

/** Objets à compter, dessinés en rangées. */
export interface IllustrationObjets {
  type: 'objets';
  objet: 'fraise' | 'pomme' | 'etoile';
  nombre: number;
  /** Rangées de dix (sinon de cinq) : aide à compter vite les grandes collections. */
  parDix?: boolean;
}

/** Un segment posé sur une règle graduée en centimètres (et en millimètres si `mm`). */
export interface IllustrationRegle {
  type: 'regle';
  /** Début et fin du segment, en millimètres. */
  debut: number;
  fin: number;
  /** Graduations des millimètres visibles. */
  mm?: boolean;
}

export const FORMES = [
  'carre',
  'rectangle',
  'triangle',
  'cercle',
  'losange',
  'pentagone',
  'hexagone',
  'octogone',
  'trapeze',
  'coeur',
] as const;
export type Forme = (typeof FORMES)[number];

/** Une figure géométrique. */
export interface IllustrationFigure {
  type: 'figure';
  forme: Forme;
}

export type Illustration = IllustrationObjets | IllustrationRegle | IllustrationFigure;

/** Ce qui distingue deux dessins (deux exercices au même énoncé ne sont pas le même exercice). */
export function cleIllustration(i: Illustration): string {
  return i.type === 'objets' ? `${i.objet} ${i.nombre}` : i.type === 'regle' ? `regle ${i.debut} ${i.fin}` : i.forme;
}

/** Nombre de côtés de chaque figure (0 pour le cercle et le cœur, qui n'ont pas de côtés droits). */
export const COTES: Record<Forme, number> = {
  carre: 4,
  rectangle: 4,
  triangle: 3,
  cercle: 0,
  losange: 4,
  pentagone: 5,
  hexagone: 6,
  octogone: 8,
  trapeze: 4,
  coeur: 0,
};

/** Les nombres qu'on lit sur le dessin (les graduations de la règle sont en centimètres, les côtés se comptent). */
export function nombresDuDessin(i: Illustration): number[] {
  return i.type === 'objets'
    ? [i.nombre]
    : i.type === 'regle'
      ? [i.debut, i.fin, i.debut / 10, i.fin / 10]
      : [COTES[i.forme]];
}

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
  /** Figure dessinée dans l’énoncé. */
  illustration?: Illustration;
  /** Mots mélangés à remettre dans l'ordre (jeu « La phrase en désordre ») ; la réponse est la phrase. */
  motsEnDesordre?: string[];
  /**
   * Les choix sont des images (jeu « Les images ») : le dessin d'un mot de
   * l'imagier, ou une scène par choix (voir `scenes`). Le texte des choix n'est
   * jamais affiché : il sert de clé et d'explication.
   */
  images?: 'imagier' | 'scenes';
  /** La scène dessinée pour chaque choix (« Comprendre des phrases ») ; clé : le texte du choix. */
  scenes?: Record<string, Scene>;
  /**
   * L'enfant lit seul : c'est la compétence travaillée. « Écouter » ne lit alors
   * que la consigne et la question, jamais le texte.
   */
  lectureAutonome?: boolean;
  indice: string;
  explication: string;
  facile: VersionFacile;
}

export type ExerciceQuelconque = Exercice | ExerciceTexte;

/**
 * Un objet de l'imagier posé dans une scène, sur une grille de 3 lignes et
 * 3 colonnes (de 0 à 2 ; 0.5 et 1.5 placent un objet entre deux colonnes).
 */
export interface ElementScene {
  /** Clé de l'imagier (« chat », « boîte »). */
  objet: string;
  ligne: number;
  colonne: number;
  taille?: 'petit' | 'grand';
}

/** Une petite scène dessinée, que l'enfant compare à la phrase entendue. */
export type Scene = readonly ElementScene[];

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
