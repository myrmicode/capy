// Réglages de lecture et de jeu, par enfant.
//
// Confidentialité : ce sont des réglages d'affichage et de jeu, jamais un
// diagnostic. On n'enregistre que les réglages eux-mêmes (« police : Andika »),
// jamais leur raison : un diagnostic sur un mineur est une donnée de santé
// (RGPD, art. 9) que Capy ne collecte nulle part, ni en local ni sur le serveur.
//
// Références : guide de style de la British Dyslexia Association, règles
// européennes du FALC, WCAG 2.2 (1.4.4, 1.4.12, 2.2.2, 2.3.3, 2.5.7, 2.5.8) et RGAA.
import { z } from 'zod';

export const POLICES_LECTURE = ['nunito', 'andika', 'luciole', 'opendyslexic'] as const;
export type PoliceLecture = (typeof POLICES_LECTURE)[number];

export const TAILLES_TEXTE = ['normale', 'grande', 'tresGrande'] as const;
export type TailleTexte = (typeof TAILLES_TEXTE)[number];

export const FONDS = ['defaut', 'creme', 'bleu'] as const;
export type Fond = (typeof FONDS)[number];

/** Paires de couleurs proposées pour la coloration syllabique (contraste vérifié par les tests). */
export const COULEURS_SYLLABES = {
  sarcelleBrun: ['#1f7a6d', '#b25d34'],
  bleuRouge: ['#1f4e9c', '#a8322d'],
  vertViolet: ['#2e6b2e', '#7a3b8f'],
} as const;
export type CouleursSyllabes = keyof typeof COULEURS_SYLLABES;

export interface ReglagesEnfant {
  // Lecture et texte
  police: PoliceLecture;
  taille: TailleTexte;
  espacements: boolean;
  syllabes: boolean;
  couleursSyllabes: CouleursSyllabes;
  alternanceLignes: boolean;
  fond: Fond;
  lectureAuto: boolean;
  lectureLente: boolean;
  falc: boolean;
  motsExpliques: boolean;
  // Calcul
  aidesVisuelles: boolean;
  /** Nombre de réponses proposées (4 par défaut). */
  nombreChoix: 2 | 3 | 4;
  tableConsultable: boolean;
  // Geste
  toucherPuisToucher: boolean;
  grandesCibles: boolean;
  // Attention
  modeCalme: boolean;
  sessionsCourtes: boolean;
  /** Minutes entre deux pauses proposées ; 0 = jamais. */
  pause: 0 | 5 | 10;
  uneChoseALaFois: boolean;
}

export const REGLAGES_PAR_DEFAUT: ReglagesEnfant = {
  police: 'nunito',
  taille: 'normale',
  espacements: false,
  syllabes: false,
  couleursSyllabes: 'sarcelleBrun',
  alternanceLignes: false,
  fond: 'defaut',
  lectureAuto: false,
  lectureLente: false,
  falc: false,
  motsExpliques: false,
  aidesVisuelles: false,
  nombreChoix: 4,
  tableConsultable: false,
  toucherPuisToucher: false,
  grandesCibles: false,
  modeCalme: false,
  sessionsCourtes: false,
  pause: 0,
  uneChoseALaFois: false,
};

/**
 * Validation stricte, pour le stockage local comme pour le serveur : seuls ces
 * champs existent, toute autre clé est ignorée. Une valeur absente ou abîmée
 * reprend sa valeur par défaut.
 */
export const SchemaReglages = z.object({
  police: z.enum(POLICES_LECTURE).catch(REGLAGES_PAR_DEFAUT.police),
  taille: z.enum(TAILLES_TEXTE).catch(REGLAGES_PAR_DEFAUT.taille),
  espacements: z.boolean().catch(false),
  syllabes: z.boolean().catch(false),
  couleursSyllabes: z.enum(['sarcelleBrun', 'bleuRouge', 'vertViolet']).catch('sarcelleBrun'),
  alternanceLignes: z.boolean().catch(false),
  fond: z.enum(FONDS).catch('defaut'),
  lectureAuto: z.boolean().catch(false),
  lectureLente: z.boolean().catch(false),
  falc: z.boolean().catch(false),
  motsExpliques: z.boolean().catch(false),
  aidesVisuelles: z.boolean().catch(false),
  nombreChoix: z.union([z.literal(2), z.literal(3), z.literal(4)]).catch(4),
  tableConsultable: z.boolean().catch(false),
  toucherPuisToucher: z.boolean().catch(false),
  grandesCibles: z.boolean().catch(false),
  modeCalme: z.boolean().catch(false),
  sessionsCourtes: z.boolean().catch(false),
  pause: z.union([z.literal(0), z.literal(5), z.literal(10)]).catch(0),
  uneChoseALaFois: z.boolean().catch(false),
});

/** Relit des réglages venus du stockage ou du serveur ; jamais d'erreur. */
export function lireReglages(brut: unknown): ReglagesEnfant {
  const objet = typeof brut === 'object' && brut !== null ? brut : {};
  return SchemaReglages.parse({ ...REGLAGES_PAR_DEFAUT, ...objet });
}

export function sontParDefaut(r: ReglagesEnfant): boolean {
  return (Object.keys(REGLAGES_PAR_DEFAUT) as (keyof ReglagesEnfant)[]).every((k) => r[k] === REGLAGES_PAR_DEFAUT[k]);
}

/** Une option de lecture est-elle active ? (le manuscrit est alors masqué) */
export function aideALaLectureActive(r: ReglagesEnfant): boolean {
  return (
    r.police !== 'nunito' ||
    r.taille !== 'normale' ||
    r.espacements ||
    r.syllabes ||
    r.alternanceLignes ||
    r.lectureAuto ||
    r.falc ||
    r.motsExpliques
  );
}

// --- Raccourcis : ils activent un groupe d'options. Le raccourci choisi n'est jamais enregistré. ---

export interface Raccourci {
  id: string;
  titre: string;
  description: string;
  reglages: Partial<ReglagesEnfant>;
}

export const RACCOURCIS: readonly Raccourci[] = [
  {
    id: 'lecture',
    titre: 'Aide à la lecture',
    description: 'Police plus lisible, espaces plus grands, syllabes en couleur, lecture à voix haute.',
    reglages: {
      police: 'andika',
      taille: 'grande',
      espacements: true,
      syllabes: true,
      alternanceLignes: true,
      fond: 'creme',
      lectureAuto: true,
      motsExpliques: true,
    },
  },
  {
    id: 'calcul',
    titre: 'Aide en calcul',
    description: 'Cubes et barres pour voir les nombres, moins de réponses, table consultable.',
    reglages: {
      aidesVisuelles: true,
      nombreChoix: 3,
      tableConsultable: true,
      motsExpliques: true,
    },
  },
  {
    id: 'geste',
    titre: 'Aide au geste',
    description: 'Toucher au lieu de glisser, grandes cibles, aucun geste précis.',
    reglages: {
      toucherPuisToucher: true,
      grandesCibles: true,
      taille: 'grande',
    },
  },
  {
    id: 'attention',
    titre: 'Aide à l’attention',
    description: 'Écran calme, étapes courtes, une chose à la fois, pauses proposées.',
    reglages: {
      modeCalme: true,
      sessionsCourtes: true,
      pause: 10,
      uneChoseALaFois: true,
      nombreChoix: 3,
    },
  },
  {
    id: 'tresFacile',
    titre: 'Lecture très facile',
    description: 'Consignes en phrases courtes, très gros texte, tout est lu à voix haute.',
    reglages: {
      falc: true,
      taille: 'tresGrande',
      espacements: true,
      syllabes: true,
      lectureAuto: true,
      lectureLente: true,
      motsExpliques: true,
      nombreChoix: 3,
    },
  },
];

export function appliquerRaccourci(r: ReglagesEnfant, raccourci: Raccourci): ReglagesEnfant {
  return { ...r, ...raccourci.reglages };
}

/** Un raccourci est actif quand tous ses réglages sont en place. */
export function raccourciActif(r: ReglagesEnfant, raccourci: Raccourci): boolean {
  return (Object.entries(raccourci.reglages) as [keyof ReglagesEnfant, unknown][]).every(([k, v]) => r[k] === v);
}

/**
 * Retire un raccourci : ses réglages reviennent à leur valeur habituelle, sauf
 * ceux dont un autre raccourci encore actif a besoin.
 */
export function retirerRaccourci(r: ReglagesEnfant, raccourci: Raccourci): ReglagesEnfant {
  const autres = RACCOURCIS.filter((x) => x.id !== raccourci.id && raccourciActif(r, x));
  const garder = new Set(autres.flatMap((x) => Object.keys(x.reglages)));
  const retour = { ...r } as Record<keyof ReglagesEnfant, unknown>;
  for (const k of Object.keys(raccourci.reglages) as (keyof ReglagesEnfant)[]) {
    if (!garder.has(k)) retour[k] = REGLAGES_PAR_DEFAUT[k];
  }
  return retour as unknown as ReglagesEnfant;
}

/** Un toucher sur un raccourci : il s'active, ou se retire s'il l'était déjà. */
export function basculerRaccourci(r: ReglagesEnfant, raccourci: Raccourci): ReglagesEnfant {
  return raccourciActif(r, raccourci) ? retirerRaccourci(r, raccourci) : appliquerRaccourci(r, raccourci);
}
