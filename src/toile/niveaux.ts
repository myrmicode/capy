// Niveaux de la toile, par domaine, entre 0 et 1.
import type { Classe } from '@/config/classes';
import { domainesDe, type Domaine, type DomaineId } from '@/config/domaines';

export type Niveaux = Partial<Record<DomaineId, number>>;

export interface ToileEnfant {
  /** Niveaux lus sur la fiche de l'école. Jamais modifiés ensuite : c'est la référence. */
  septembre: Niveaux;
  /** Niveaux d'aujourd'hui, qui évoluent avec les résultats aux exercices. */
  actuelle: Niveaux;
  /** Date de saisie de la fiche (AAAA-MM-JJ). */
  saisieLe: string;
}

/**
 * Poids d'une étape terminée dans le niveau d'un domaine.
 *
 * Le niveau suit une moyenne glissante simple (moyenne mobile exponentielle) :
 *   nouveau niveau = 80 % × ancien niveau + 20 % × réussite de l'étape
 * où la réussite de l'étape est la part des questions réussies du premier coup.
 * Une étape ne fait donc jamais basculer la toile d'un coup, et les dix
 * dernières étapes environ comptent pour l'essentiel.
 */
export const POIDS_ETAPE = 0.2;

/** Niveau proposé par défaut dans la saisie à la main. */
export const NIVEAU_PAR_DEFAUT = 0.5;

export function borner(niveau: number): number {
  return Math.round(Math.min(1, Math.max(0, niveau)) * 100) / 100;
}

export function niveauApresEtape(ancien: number, reussiesPremierCoup: number, nombreQuestions: number): number {
  const reussite = nombreQuestions > 0 ? reussiesPremierCoup / nombreQuestions : 0;
  return borner((1 - POIDS_ETAPE) * ancien + POIDS_ETAPE * reussite);
}

/** Toile complète pour une classe : chaque domaine de la configuration a un niveau. */
export function completerNiveaux(classe: Classe, niveaux: Niveaux): Record<DomaineId, number> {
  const complets = {} as Record<DomaineId, number>;
  for (const d of domainesDe(classe)) complets[d.id] = borner(niveaux[d.id] ?? NIVEAU_PAR_DEFAUT);
  return complets;
}

export function nouvelleToile(classe: Classe, niveaux: Niveaux, saisieLe: string): ToileEnfant {
  const complets = completerNiveaux(classe, niveaux);
  return { septembre: { ...complets }, actuelle: { ...complets }, saisieLe };
}

export function toileApresEtape(
  toile: ToileEnfant,
  domaine: DomaineId,
  reussiesPremierCoup: number,
  nombreQuestions: number,
): ToileEnfant {
  const ancien = toile.actuelle[domaine] ?? toile.septembre[domaine] ?? NIVEAU_PAR_DEFAUT;
  return {
    ...toile,
    actuelle: { ...toile.actuelle, [domaine]: niveauApresEtape(ancien, reussiesPremierCoup, nombreQuestions) },
  };
}

// --- Bilan pour les parents ---

/** À partir de ce niveau, un domaine figure dans « Ce qui va bien ». */
export const SEUIL_SOLIDE = 0.7;

export interface Bilan {
  forts: Domaine[];
  aConsolider: Domaine[];
  /** Domaine le plus fragile, par lequel commence le parcours. */
  priorite: Domaine | null;
}

export function analyserToile(classe: Classe, niveaux: Niveaux): Bilan {
  const domaines = domainesDe(classe);
  const niveau = (d: Domaine) => niveaux[d.id] ?? NIVEAU_PAR_DEFAUT;
  const fragiles = domaines.filter((d) => niveau(d) < SEUIL_SOLIDE);
  // En cas d'égalité, on garde l'ordre de la fiche.
  const priorite = fragiles.reduce<Domaine | null>((min, d) => (min === null || niveau(d) < niveau(min) ? d : min), null);
  return {
    forts: domaines.filter((d) => niveau(d) >= SEUIL_SOLIDE),
    aConsolider: fragiles.filter((d) => d !== priorite),
    priorite,
  };
}

/** Domaines du plus fragile au plus solide, pour ordonner les thèmes du parcours. */
export function domainesParPriorite(classe: Classe, niveaux: Niveaux | undefined): DomaineId[] {
  const domaines = domainesDe(classe);
  if (!niveaux) return domaines.map((d) => d.id);
  return [...domaines]
    .sort((a, b) => (niveaux[a.id] ?? NIVEAU_PAR_DEFAUT) - (niveaux[b.id] ?? NIVEAU_PAR_DEFAUT))
    .map((d) => d.id);
}
