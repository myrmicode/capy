// Axes des toiles des évaluations nationales « Repères » (septembre), par classe
// et par matière. Chaque fiche de positionnement remise aux parents porte une
// toile par matière (français, mathématiques) ; chaque axe est une compétence,
// notée + / ++ / +++.
//
// Source : DEPP, « Évaluations nationales Repères CP-CE1-CE2-CM1-CM2 », diaporama
// de présentation 2026, planches « Des compétences illustrées par des
// pictogrammes » (libellés tels qu'ils apparaissent pour les parents).
// L'ordre exact des axes sur la toile peut différer : l'analyse de la photo
// associe les axes par leur libellé, et le parent vérifie toujours.
//
// Rien n'est codé en dur ailleurs : le reste de l'appli lit cette configuration.
import type { Classe } from './classes';

export const MATIERES = ['francais', 'mathematiques'] as const;
export type Matiere = (typeof MATIERES)[number];

export const LIBELLES_MATIERES: Record<Matiere, string> = {
  francais: 'Français',
  mathematiques: 'Mathématiques',
};

export type DomaineId =
  // Français
  | 'comprendre-mots'
  | 'comprendre-phrases'
  | 'comprendre-texte-entendu'
  | 'manipuler-syllabes'
  | 'manipuler-phonemes'
  | 'nom-lettres'
  | 'son-lettres'
  | 'lire-mots'
  | 'lire-texte'
  | 'ecrire-syllabes'
  | 'ecrire-mots'
  | 'comprendre-texte-lu'
  | 'comprendre-phrases-lues'
  | 'synonymes'
  | 'familles-mots'
  | 'synonymes-familles'
  | 'sujet-verbe'
  | 'sujet-verbe-complement'
  | 'nature-mots'
  | 'accord-nom-adjectif'
  | 'conjugaison'
  | 'accord-sujet-verbe'
  // Mathématiques
  | 'compter-objets'
  | 'lire-nombres'
  | 'ecrire-nombres'
  | 'comparer-nombres'
  | 'ligne-graduee'
  | 'resoudre-problemes'
  | 'denombrer'
  | 'calcul-mental'
  | 'tables-addition'
  | 'tables-multiplication'
  | 'poser-calculer'
  | 'fractions'
  | 'reconnaitre-nombres'
  | 'representations-nombres'
  // Ateliers, hors des toiles
  | 'geometrie'
  | 'grandeurs';

export interface Domaine {
  id: DomaineId;
  matiere: Matiere;
  libelle: string;
  /**
   * Vrai si la compétence ne peut pas être travaillée dans Capy (lecture à voix
   * haute : l'appli n'enregistre jamais la voix). L'axe reste sur la toile.
   */
  horsAppli?: boolean;
}

const fr = (id: DomaineId, libelle: string, horsAppli?: boolean): Domaine => ({
  id,
  matiere: 'francais',
  libelle,
  ...(horsAppli ? { horsAppli } : {}),
});
const ma = (id: DomaineId, libelle: string): Domaine => ({ id, matiere: 'mathematiques', libelle });

export const DOMAINES_PAR_CLASSE: Record<Classe, Domaine[]> = {
  CP: [
    fr('comprendre-mots', 'Comprendre des mots'),
    fr('comprendre-phrases', 'Comprendre des phrases'),
    fr('comprendre-texte-entendu', 'Comprendre un texte'),
    fr('manipuler-syllabes', 'Manipuler des syllabes'),
    fr('manipuler-phonemes', 'Manipuler des phonèmes'),
    fr('nom-lettres', 'Connaître le nom des lettres'),
    fr('son-lettres', 'Connaître le son des lettres'),
    ma('compter-objets', 'Compter des objets'),
    ma('lire-nombres', 'Lire des nombres'),
    ma('ecrire-nombres', 'Écrire des nombres'),
    ma('comparer-nombres', 'Comparer des nombres'),
    ma('ligne-graduee', 'Placer un nombre sur une ligne graduée'),
    ma('resoudre-problemes', 'Résoudre des problèmes'),
  ],
  CE1: [
    fr('comprendre-mots', 'Comprendre des mots'),
    fr('comprendre-phrases', 'Comprendre des phrases'),
    fr('lire-mots', 'Lire à voix haute des mots', true),
    fr('lire-texte', 'Lire à voix haute un texte', true),
    fr('ecrire-syllabes', 'Écrire des syllabes'),
    fr('ecrire-mots', 'Écrire des mots'),
    fr('comprendre-phrases-lues', 'Comprendre des phrases lues'),
    fr('comprendre-texte-lu', 'Comprendre un texte lu'),
    ma('lire-nombres', 'Lire des nombres'),
    ma('ecrire-nombres', 'Écrire des nombres'),
    ma('comparer-nombres', 'Comparer des nombres'),
    ma('denombrer', 'Dénombrer'),
    ma('calcul-mental', 'Calculer rapidement'),
    ma('tables-addition', 'Connaître les tables d’addition'),
    ma('ligne-graduee', 'Placer un nombre sur une ligne graduée'),
    ma('resoudre-problemes', 'Résoudre des problèmes'),
  ],
  CE2: [
    fr('comprendre-texte-entendu', 'Comprendre un texte et des phrases'),
    fr('lire-texte', 'Lire à voix haute un texte', true),
    fr('comprendre-phrases-lues', 'Comprendre des phrases lues'),
    fr('comprendre-texte-lu', 'Comprendre un texte lu'),
    fr('ecrire-mots', 'Écrire des mots'),
    fr('synonymes', 'Reconnaître des synonymes'),
    fr('familles-mots', 'Reconnaître des mots de la même famille'),
    fr('sujet-verbe', 'Repérer le sujet et le verbe'),
    fr('nature-mots', 'Identifier la nature des mots'),
    fr('accord-nom-adjectif', 'Accorder le nom et l’adjectif'),
    fr('conjugaison', 'Mémoriser des temps de conjugaison'),
    ma('denombrer', 'Dénombrer'),
    ma('ecrire-nombres', 'Écrire des nombres'),
    ma('reconnaitre-nombres', 'Reconnaître des nombres'),
    ma('ligne-graduee', 'Placer un nombre sur une ligne graduée'),
    ma('fractions', 'Connaître et comprendre les fractions'),
    ma('poser-calculer', 'Poser et calculer'),
    ma('calcul-mental', 'Calculer rapidement'),
    ma('tables-addition', 'Connaître les tables d’addition'),
    ma('resoudre-problemes', 'Résoudre des problèmes'),
  ],
  CM1: [
    fr('comprendre-texte-entendu', 'Comprendre un texte'),
    fr('lire-texte', 'Lire à voix haute un texte', true),
    fr('comprendre-texte-lu', 'Comprendre un texte lu'),
    fr('ecrire-mots', 'Écrire des mots'),
    fr('synonymes', 'Reconnaître des synonymes'),
    fr('familles-mots', 'Reconnaître des mots de la même famille'),
    fr('sujet-verbe', 'Repérer le sujet et le verbe'),
    fr('nature-mots', 'Identifier la nature des mots'),
    fr('accord-nom-adjectif', 'Accorder le nom et l’adjectif'),
    fr('accord-sujet-verbe', 'Accorder le sujet et le verbe'),
    fr('conjugaison', 'Mémoriser des temps de conjugaison'),
    ma('ecrire-nombres', 'Écrire des nombres'),
    ma('reconnaitre-nombres', 'Reconnaître des nombres'),
    ma('ligne-graduee', 'Placer un nombre sur une ligne graduée'),
    ma('poser-calculer', 'Poser et calculer'),
    ma('calcul-mental', 'Calculer rapidement'),
    ma('tables-multiplication', 'Connaître les tables de multiplication'),
    ma('resoudre-problemes', 'Résoudre des problèmes'),
  ],
  CM2: [
    fr('comprendre-texte-entendu', 'Comprendre un texte'),
    fr('lire-texte', 'Lire à voix haute un texte', true),
    fr('comprendre-texte-lu', 'Comprendre un texte lu'),
    fr('ecrire-mots', 'Écrire des mots'),
    fr('synonymes-familles', 'Reconnaître des synonymes et des mots de la même famille'),
    fr('sujet-verbe-complement', 'Repérer le sujet, le verbe et le complément'),
    fr('nature-mots', 'Identifier la nature des mots'),
    fr('accord-nom-adjectif', 'Accorder le nom et l’adjectif'),
    fr('accord-sujet-verbe', 'Maîtriser l’accord du verbe conjugué'),
    ma('representations-nombres', 'Utiliser différentes représentations des nombres'),
    ma('ecrire-nombres', 'Écrire des nombres'),
    ma('ligne-graduee', 'Placer un nombre sur une ligne graduée'),
    ma('poser-calculer', 'Poser et calculer'),
    ma('calcul-mental', 'Calculer rapidement'),
    ma('tables-multiplication', 'Connaître les tables de multiplication'),
    ma('resoudre-problemes', 'Résoudre des problèmes'),
  ],
};

/**
 * Ateliers : des compétences du programme que les évaluations Repères ne
 * mesurent pas (géométrie, grandeurs et mesures). Ils se jouent en
 * entraînement libre, sans jamais changer la toile.
 */
export const ATELIERS: Partial<Record<DomaineId, { libelle: string; matiere: Matiere }>> = {
  geometrie: { libelle: 'Les formes', matiere: 'mathematiques' },
  grandeurs: { libelle: 'Les mesures', matiere: 'mathematiques' },
};

export function estAtelier(id: DomaineId): boolean {
  return ATELIERS[id] !== undefined;
}

/** Tous les axes d'une classe, ou seulement ceux d'une matière. */
export function domainesDe(classe: Classe, matiere?: Matiere): Domaine[] {
  const tous = DOMAINES_PAR_CLASSE[classe];
  return matiere ? tous.filter((d) => d.matiere === matiere) : tous;
}

export function domaineDe(classe: Classe, id: DomaineId): Domaine | undefined {
  return DOMAINES_PAR_CLASSE[classe].find((d) => d.id === id);
}
