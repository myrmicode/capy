// Niveaux des toiles, par axe, entre 0 et 1.
//
// La fiche de l'école note chaque axe + / ++ / +++. On les enregistre comme 1/3,
// 2/3 et 1 (le contour de la toile). La toile du jour évolue ensuite par petites
// touches avec les exercices, et on la relit avec les mêmes symboles.
import type { Classe } from '@/config/classes';
import { domainesDe, MATIERES, type Domaine, type DomaineId, type Matiere } from '@/config/domaines';

export type Niveaux = Partial<Record<DomaineId, number>>;

export type Symbole = '+' | '++' | '+++';
export const SYMBOLES: readonly Symbole[] = ['+', '++', '+++'];

const VALEUR_SYMBOLE: Record<Symbole, number> = { '+': 1 / 3, '++': 2 / 3, '+++': 1 };

export interface ToileEnfant {
  /** Niveaux lus sur les fiches de l'école (les deux matières). Jamais modifiés ensuite : c'est la référence. */
  septembre: Niveaux;
  /** Niveaux d'aujourd'hui, qui évoluent avec les résultats aux exercices. */
  actuelle: Niveaux;
  /** Date de saisie de chaque fiche (AAAA-MM-JJ). */
  saisieLe: Partial<Record<Matiere, string>>;
}

/**
 * Poids d'une étape terminée dans le niveau d'un axe.
 *
 * Le niveau suit une moyenne glissante simple (moyenne mobile exponentielle) :
 *   nouveau niveau = 80 % × ancien niveau + 20 % × réussite de l'étape
 * où la réussite de l'étape est la part des questions réussies du premier coup.
 * Une étape ne fait donc jamais basculer la toile d'un coup, et les dix
 * dernières étapes environ comptent pour l'essentiel.
 */
export const POIDS_ETAPE = 0.2;

/** Niveau proposé par défaut dans la saisie à la main (++). */
export const NIVEAU_PAR_DEFAUT = VALEUR_SYMBOLE['++'];

export function borner(niveau: number): number {
  return Math.round(Math.min(1, Math.max(0, niveau)) * 100) / 100;
}

export function valeurDe(symbole: Symbole): number {
  return borner(VALEUR_SYMBOLE[symbole]);
}

/**
 * Symbole correspondant à un niveau : on coupe à mi-chemin entre deux anneaux
 * (+ sous 0,5 ; +++ à partir de 0,83).
 */
export function symboleDe(niveau: number): Symbole {
  if (niveau < 0.5) return '+';
  if (niveau < 0.83) return '++';
  return '+++';
}

export function niveauApresEtape(ancien: number, reussiesPremierCoup: number, nombreQuestions: number): number {
  const reussite = nombreQuestions > 0 ? reussiesPremierCoup / nombreQuestions : 0;
  return borner((1 - POIDS_ETAPE) * ancien + POIDS_ETAPE * reussite);
}

/** Niveaux complets pour une classe (et une matière) : chaque axe de la configuration a une valeur. */
export function completerNiveaux(classe: Classe, niveaux: Niveaux, matiere?: Matiere): Record<DomaineId, number> {
  const complets = {} as Record<DomaineId, number>;
  for (const d of domainesDe(classe, matiere)) complets[d.id] = borner(niveaux[d.id] ?? NIVEAU_PAR_DEFAUT);
  return complets;
}

/** Une matière a-t-elle été saisie ? */
export function ficheSaisie(toile: ToileEnfant | undefined, matiere: Matiere): boolean {
  return toile?.saisieLe[matiere] !== undefined;
}

/**
 * Enregistre la fiche d'une matière : ses niveaux deviennent la référence de
 * septembre et la toile du jour pour cette matière. L'autre matière ne bouge pas.
 */
export function appliquerFiche(
  toile: ToileEnfant | undefined,
  classe: Classe,
  matiere: Matiere,
  niveaux: Niveaux,
  jour: string,
): ToileEnfant {
  const fiche = completerNiveaux(classe, niveaux, matiere);
  return {
    septembre: { ...toile?.septembre, ...fiche },
    actuelle: { ...toile?.actuelle, ...fiche },
    saisieLe: { ...toile?.saisieLe, [matiere]: jour },
  };
}

export function toileApresEtape(
  toile: ToileEnfant,
  domaine: DomaineId,
  reussiesPremierCoup: number,
  nombreQuestions: number,
): ToileEnfant {
  const ancien = toile.actuelle[domaine] ?? toile.septembre[domaine];
  if (ancien === undefined) return toile; // Fiche de cette matière pas encore saisie.
  return {
    ...toile,
    actuelle: { ...toile.actuelle, [domaine]: niveauApresEtape(ancien, reussiesPremierCoup, nombreQuestions) },
  };
}

// --- Bilan pour les parents ---

export interface Bilan {
  /** +++ : ce qui va bien. */
  forts: Domaine[];
  /** ++ (et les autres + que la priorité). */
  aConsolider: Domaine[];
  /** L'axe le plus fragile de la matière, par lequel commence le parcours. */
  priorite: Domaine | null;
}

export function analyserToile(classe: Classe, matiere: Matiere, niveaux: Niveaux): Bilan {
  const domaines = domainesDe(classe, matiere).filter((d) => niveaux[d.id] !== undefined);
  const niveau = (d: Domaine) => niveaux[d.id]!;
  const fragiles = domaines.filter((d) => symboleDe(niveau(d)) !== '+++');
  // La priorité porte sur un axe que l'appli sait travailler ; en cas d'égalité, l'ordre de la fiche.
  const priorite = fragiles
    .filter((d) => !d.horsAppli)
    .reduce<Domaine | null>((min, d) => (min === null || niveau(d) < niveau(min) ? d : min), null);
  return {
    forts: domaines.filter((d) => symboleDe(niveau(d)) === '+++'),
    aConsolider: fragiles.filter((d) => d !== priorite),
    priorite,
  };
}

/** Axes prioritaires de chaque matière saisie. */
export function prioritesDe(classe: Classe, toile: ToileEnfant | undefined): Set<DomaineId> {
  const ids = new Set<DomaineId>();
  if (!toile) return ids;
  for (const matiere of MATIERES) {
    if (!ficheSaisie(toile, matiere)) continue;
    const p = analyserToile(classe, matiere, toile.actuelle).priorite;
    if (p) ids.add(p.id);
  }
  return ids;
}


/**
 * Remet au format actuel une toile enregistrée avant la prise en compte des deux
 * matières : on garde les axes qui existent toujours pour la classe, et la date
 * de saisie devient celle de la fiche de mathématiques.
 */
export function migrerToile(ancienne: unknown, classe: Classe): ToileEnfant | undefined {
  if (!ancienne || typeof ancienne !== 'object') return undefined;
  const t = ancienne as { septembre?: Niveaux; actuelle?: Niveaux; saisieLe?: unknown };
  const ids = new Set(domainesDe(classe).map((d) => d.id));
  const garder = (n: Niveaux | undefined): Niveaux =>
    Object.fromEntries(Object.entries(n ?? {}).filter(([id]) => ids.has(id as DomaineId)));
  const saisieLe =
    typeof t.saisieLe === 'string' ? { mathematiques: t.saisieLe } : ((t.saisieLe ?? {}) as ToileEnfant['saisieLe']);
  const septembre = garder(t.septembre);
  if (Object.keys(septembre).length === 0) return undefined;
  return { septembre, actuelle: { ...septembre, ...garder(t.actuelle) }, saisieLe };
}
