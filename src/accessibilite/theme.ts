// Thème adapté aux réglages d'un enfant : polices, tailles, espacements, fond,
// taille des cibles et animations. Les écrans et les mini-jeux lisent tout ici
// (via `useThemeEnfant`) au lieu des styles fixes de `theme.ts`.
import type { TextStyle } from 'react-native';

import { couleurs, espaces, formes, polices, typo } from '@/theme';

import { couleurLisible } from './contraste';

import {
  COULEURS_SYLLABES,
  aideALaLectureActive,
  type Fond,
  type PoliceLecture,
  type ReglagesEnfant,
} from './reglages';

/** Noms des polices chargées dans `app/_layout.tsx`, par police de lecture. */
export const POLICES_CHARGEES: Record<
  PoliceLecture,
  { normale: string; grasse: string; titre: string; titreGras: string }
> = {
  nunito: {
    normale: polices.nunito,
    grasse: polices.nunitoGras,
    titre: polices.fredoka,
    titreGras: polices.fredokaGras,
  },
  andika: {
    normale: 'Andika_400Regular',
    grasse: 'Andika_700Bold',
    titre: 'Andika_700Bold',
    titreGras: 'Andika_700Bold',
  },
  luciole: {
    normale: 'Luciole-Regular',
    grasse: 'Luciole-Bold',
    titre: 'Luciole-Bold',
    titreGras: 'Luciole-Bold',
  },
  opendyslexic: {
    normale: 'OpenDyslexic-Regular',
    grasse: 'OpenDyslexic-Bold',
    titre: 'OpenDyslexic-Bold',
    titreGras: 'OpenDyslexic-Bold',
  },
};

export const LIBELLES_POLICES: Record<PoliceLecture, string> = {
  nunito: 'Nunito (habituelle)',
  andika: 'Andika',
  luciole: 'Luciole',
  opendyslexic: 'OpenDyslexic',
};

export const COULEURS_FOND: Record<Fond, string> = {
  defaut: couleurs.fondPage,
  creme: couleurs.creme,
  bleu: '#e8f1f5',
};

/** Fond du soir (après 19 h) : plus chaud et un peu moins lumineux, pour ne pas éblouir. */
export const FOND_SOIR = '#ece3d3';

/** Le soir commence à 19 h et dure jusqu'au matin (6 h). */
export function estLeSoir(d: Date): boolean {
  const h = d.getHours();
  return h >= 19 || h < 6;
}

export const ECHELLES_TEXTE = {
  normale: 1,
  grande: 1.25,
  tresGrande: 1.5,
} as const;

/** Lettres muettes dans la coloration syllabique (assombrie si besoin, comme les syllabes). */
export const COULEUR_MUETTE = couleurs.gris[500];

/**
 * Fonds sur lesquels le texte coloré peut apparaître : le fond de l'écran, les
 * cartes blanches et les panneaux Bravo / Presque.
 */
const FONDS_DU_TEXTE = [couleurs.blanc, couleurs.menthe[100], couleurs.brun[100]];
/** Fond des lignes alternées : très légèrement plus foncé que le fond. */
export const FOND_LIGNE_ALTERNEE = 'rgba(18, 64, 79, 0.06)';

/** Taille minimale des cibles avec « Grandes cibles » (WCAG 2.5.8, au-delà du minimum). */
export const CIBLE_AGRANDIE = 64;

export type VarianteTexte = keyof typeof typo;

export interface ThemeEnfant {
  reglages: ReglagesEnfant;
  typo: Record<VarianteTexte, TextStyle>;
  /** Espacement supplémentaire entre les mots (WCAG 1.4.12 : 0,16 em). */
  espaceMots: boolean;
  fond: string;
  /** Couleurs des syllabes, assombries juste ce qu'il faut pour un contraste de 4,5:1 sur tous les fonds. */
  couleursSyllabes: readonly [string, string];
  couleurMuette: string;
  /** Taille minimale d'une cible tactile. */
  cible: number;
  /** Multiplicateur des espaces entre éléments touchables. */
  ecart: (e: keyof typeof espaces) => number;
  /** Animations réduites : mode calme ou réglage système « Réduire les animations ». */
  animationsReduites: boolean;
  /** Le petit mot manuscrit (Caveat) n'apparaît que sans aide à la lecture. */
  manuscritVisible: boolean;
}

const POLICES_TITRE = new Set<string>([polices.fredoka, polices.fredokaGras]);

/** Adapte un style de texte : police, taille, interligne et espacement des lettres. */
function adapter(style: TextStyle, r: ReglagesEnfant, agrandissement: number): TextStyle {
  const p = POLICES_CHARGEES[r.police];
  const famille = style.fontFamily ?? polices.nunito;
  const grasse = famille === polices.nunitoGras || famille === polices.nunitoExtraGras;
  const fontFamily =
    famille === polices.caveat
      ? famille
      : POLICES_TITRE.has(famille)
        ? famille === polices.fredokaGras
          ? p.titreGras
          : p.titre
        : grasse
          ? p.grasse
          : p.normale;
  const fontSize = Math.round((style.fontSize ?? 16) * ECHELLES_TEXTE[r.taille] * agrandissement);
  const ratio = (style.lineHeight ?? fontSize * 1.4) / (style.fontSize ?? 16);
  // WCAG 1.4.12 : interligne d'au moins 1,5 ; on va jusqu'à 2 en très grand.
  const interligne = r.espacements ? (r.taille === 'tresGrande' ? 2 : 1.5) : ratio;
  return {
    ...style,
    fontFamily,
    fontSize,
    lineHeight: Math.round(fontSize * Math.max(ratio, interligne)),
    ...(r.espacements ? { letterSpacing: Math.round(fontSize * 0.12 * 10) / 10 } : {}),
  };
}

/**
 * @param agrandissement Agrandissement propre à l'appareil (voir `echelleAppareil`) :
 * sur tablette, le texte et les espaces grandissent un peu pour rester confortables.
 */
/**
 * @param soir Ambiance du soir : le fond par défaut devient plus doux. Un fond
 * choisi dans les réglages de l'enfant (crème, bleu) est toujours respecté.
 */
export function deriverTheme(
  r: ReglagesEnfant,
  reductionSysteme = false,
  agrandissement = 1,
  soir = false,
): ThemeEnfant {
  const fondEcran = soir && r.fond === 'defaut' ? FOND_SOIR : COULEURS_FOND[r.fond];
  const fonds = [fondEcran, ...FONDS_DU_TEXTE];
  const typoAdaptee = Object.fromEntries(
    (Object.keys(typo) as VarianteTexte[]).map((k) => [k, adapter(typo[k], r, agrandissement)]),
  ) as Record<VarianteTexte, TextStyle>;
  const facteurEcart = (r.grandesCibles ? 1.5 : 1) * agrandissement;
  return {
    reglages: r,
    typo: typoAdaptee,
    espaceMots: r.espacements,
    fond: fondEcran,
    couleursSyllabes: COULEURS_SYLLABES[r.couleursSyllabes].map((c) => couleurLisible(c, fonds)) as [string, string],
    couleurMuette: couleurLisible(COULEUR_MUETTE, fonds),
    cible: r.grandesCibles ? CIBLE_AGRANDIE : formes.cibleTactile,
    ecart: (e) => Math.round(espaces[e] * facteurEcart),
    animationsReduites: r.modeCalme || reductionSysteme,
    manuscritVisible: !aideALaLectureActive(r),
  };
}

/** Plus petit côté de l'écran à partir duquel on considère l'appareil comme une tablette. */
export const COTE_TABLETTE = 600;
/** Agrandissement du texte et des espaces sur tablette. */
export const ECHELLE_TABLETTE = 1.15;

/** Agrandissement propre à l'appareil, quelle que soit son orientation. */
export function echelleAppareil(largeur: number, hauteur: number): number {
  return Math.min(largeur, hauteur) >= COTE_TABLETTE ? ECHELLE_TABLETTE : 1;
}
