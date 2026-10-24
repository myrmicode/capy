// Briques des exercices de compréhension : animaux, objets, prénoms et petites
// scènes. Les phrases, les histoires et les questions sont fabriquées par le code.
// À FAIRE RELIRE par un enseignant : tournures choisies pour chaque niveau.
import type { Alea } from '../alea';

import type { Genre } from './lexique';
import { majuscule } from './moteur';

export interface Etre {
  nom: string;
  genre: Genre;
}

const e = (nom: string, genre: Genre): Etre => ({ nom, genre });

/** Noms qui commencent par une consonne : pas d'élision (« le », « la », « du »). */
export const ANIMAUX: readonly Etre[] = [
  e('chien', 'm'),
  e('chat', 'm'),
  e('lapin', 'm'),
  e('cochon', 'm'),
  e('canard', 'm'),
  e('renard', 'm'),
  e('poule', 'f'),
  e('vache', 'f'),
  e('souris', 'f'),
  e('chèvre', 'f'),
  e('tortue', 'f'),
];

export const OBJETS: readonly Etre[] = [
  e('ballon', 'm'),
  e('livre', 'm'),
  e('chapeau', 'm'),
  e('panier', 'm'),
  e('poupée', 'f'),
  e('balle', 'f'),
  e('boîte', 'f'),
  e('clé', 'f'),
];

export const REPERES: readonly Etre[] = [e('table', 'f'), e('lit', 'm'), e('chaise', 'f'), e('banc', 'm'), e('buffet', 'm'), e('cabane', 'f')];

/** Prénoms qui commencent par une consonne (jamais « d’ » ni « qu’ » devant). */
export const PRENOMS: readonly Etre[] = [
  e('Lina', 'f'),
  e('Nora', 'f'),
  e('Jade', 'f'),
  e('Zoé', 'f'),
  e('Camille', 'f'),
  e('Sami', 'm'),
  e('Tom', 'm'),
  e('Léo', 'm'),
  e('Malik', 'm'),
  e('Rayan', 'm'),
];

export const le = (x: Etre) => `${x.genre === 'm' ? 'le' : 'la'} ${x.nom}`;
export const Le = (x: Etre) => majuscule(le(x));
export const du = (x: Etre) => `${x.genre === 'm' ? 'du' : 'de la'} ${x.nom}`;
export const il = (x: Etre) => (x.genre === 'm' ? 'il' : 'elle');
export const accorde = (x: Etre, masculin: string, feminin: string) => (x.genre === 'm' ? masculin : feminin);
/** « Ils » sauf si tout le groupe est féminin. */
export const ils = (...xs: Etre[]) => (xs.every((x) => x.genre === 'f') ? 'elles' : 'ils');

/** Tire plusieurs éléments tous différents. */
export function tirerDifferents<T>(alea: Alea, liste: readonly T[], n: number): T[] {
  return alea.melanger(liste).slice(0, n);
}

// --- Actions entre deux animaux ---

export interface Action {
  present: string;
  participe: string;
}

export const ACTIONS: readonly Action[] = [
  { present: 'pousse', participe: 'poussé' },
  { present: 'regarde', participe: 'regardé' },
  { present: 'appelle', participe: 'appelé' },
  { present: 'lave', participe: 'lavé' },
  { present: 'chatouille', participe: 'chatouillé' },
  { present: 'poursuit', participe: 'poursuivi' },
  { present: 'suit', participe: 'suivi' },
  { present: 'réveille', participe: 'réveillé' },
];

const participe = (v: Action, patient: Etre) => v.participe + (patient.genre === 'f' ? 'e' : '');

/** « Le chien pousse le chat. » */
export const actif = (agent: Etre, patient: Etre, v: Action) => `${Le(agent)} ${v.present} ${le(patient)}.`;
/** « Le chat est poussé par le chien. » */
export const passif = (agent: Etre, patient: Etre, v: Action) => `${Le(patient)} est ${participe(v, patient)} par ${le(agent)}.`;
/** « C’est le chien qui pousse le chat. » */
export const cliveeSujet = (agent: Etre, patient: Etre, v: Action) => `C’est ${le(agent)} qui ${v.present} ${le(patient)}.`;
/** « C’est le chat que le chien pousse. » */
export const cliveeObjet = (agent: Etre, patient: Etre, v: Action) => `C’est ${le(patient)} que ${le(agent)} ${v.present}.`;

// --- Où sont les objets ---

export type Position = 'sur' | 'sous' | 'devant' | 'derrière';
export const POSITIONS: readonly Position[] = ['sur', 'sous', 'devant', 'derrière'];

/** « Le ballon est sous la table. » */
export const position = (objet: Etre, p: Position, repere: Etre) => `${Le(objet)} est ${p} ${le(repere)}.`;

/** La même scène vue depuis le repère : « La table est au-dessus du ballon. » */
export function positionInverse(objet: Etre, p: Position, repere: Etre): string {
  const vue = { sur: `sous ${le(objet)}`, sous: `au-dessus ${du(objet)}`, devant: `derrière ${le(objet)}`, derrière: `devant ${le(objet)}` }[p];
  return `${Le(repere)} est ${vue}.`;
}

// --- Ce que font les animaux ---

export interface Activite {
  present: string;
  infinitif: string;
  participe: string;
}

/** Toutes commencent par une consonne : « ne dort pas », « avant de jouer ». */
export const ACTIVITES: readonly Activite[] = [
  { present: 'dort', infinitif: 'dormir', participe: 'dormi' },
  { present: 'joue', infinitif: 'jouer', participe: 'joué' },
  { present: 'mange', infinitif: 'manger', participe: 'mangé' },
  { present: 'court', infinitif: 'courir', participe: 'couru' },
  { present: 'saute', infinitif: 'sauter', participe: 'sauté' },
  { present: 'boit', infinitif: 'boire', participe: 'bu' },
];

// --- Comparer deux enfants ---

export interface Comparaison {
  adjectif: [masculin: string, feminin: string];
  contraire: [masculin: string, feminin: string];
}

export const COMPARAISONS: readonly Comparaison[] = [
  { adjectif: ['grand', 'grande'], contraire: ['petit', 'petite'] },
  { adjectif: ['rapide', 'rapide'], contraire: ['lent', 'lente'] },
  { adjectif: ['âgé', 'âgée'], contraire: ['jeune', 'jeune'] },
  { adjectif: ['fort', 'forte'], contraire: ['faible', 'faible'] },
];
