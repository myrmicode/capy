// Progression d'un enfant : étapes réussies, étoiles, coffres, jours d'activité.
// Fonctions pures : elles renvoient une nouvelle progression sans rien modifier.
import type { Theme } from '@/config/parcours';
import { graineDepuisTexte } from '@/exercices';

export interface ResultatEtape {
  /** Meilleur résultat obtenu, de 1 à 3 étoiles. */
  etoiles: number;
  /** Nombre de fois où l'étape a été terminée. */
  fois: number;
}

export interface ProgressionEnfant {
  etapes: Record<string, ResultatEtape>;
  coffresOuverts: string[];
  /** Jours où l'enfant a terminé au moins une étape (AAAA-MM-JJ, heure locale). */
  jours: string[];
  /** Temps passé en étape, en secondes, par jour. */
  tempsParJour: Record<string, number>;
}

/** Étoiles gagnées en ouvrant un coffre. */
export const ETOILES_COFFRE = 3;
const JOURS_CONSERVES = 400;
const JOURS_TEMPS_CONSERVES = 60;

export function progressionVide(): ProgressionEnfant {
  return { etapes: {}, coffresOuverts: [], jours: [], tempsParJour: {} };
}

/**
 * Étoiles d'une étape terminée : jamais zéro, finir l'étape compte toujours.
 * 3 étoiles si tout est réussi du premier coup, 2 à partir de 60 %, sinon 1.
 */
export function etoilesPour(reussiesPremierCoup: number, nombreQuestions: number): number {
  const part = nombreQuestions > 0 ? reussiesPremierCoup / nombreQuestions : 0;
  if (part >= 1) return 3;
  if (part >= 0.6) return 2;
  return 1;
}

/** Date locale au format AAAA-MM-JJ. */
export function dateLocale(d: Date): string {
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
}

function joursEntre(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

export function enregistrerEtape(
  p: ProgressionEnfant,
  etapeId: string,
  reussiesPremierCoup: number,
  nombreQuestions: number,
  dureeSecondes: number,
  maintenant: Date,
): ProgressionEnfant {
  const jour = dateLocale(maintenant);
  const avant = p.etapes[etapeId];
  const etoiles = Math.max(avant?.etoiles ?? 0, etoilesPour(reussiesPremierCoup, nombreQuestions));
  const jours = p.jours.includes(jour) ? p.jours : [...p.jours, jour].sort().slice(-JOURS_CONSERVES);
  const tempsParJour = Object.fromEntries(
    Object.entries({ ...p.tempsParJour, [jour]: (p.tempsParJour[jour] ?? 0) + Math.max(0, Math.round(dureeSecondes)) })
      .filter(([j]) => joursEntre(j, jour) < JOURS_TEMPS_CONSERVES),
  );
  return {
    ...p,
    etapes: { ...p.etapes, [etapeId]: { etoiles, fois: (avant?.fois ?? 0) + 1 } },
    jours,
    tempsParJour,
  };
}

export function ouvrirCoffre(p: ProgressionEnfant, coffreId: string): ProgressionEnfant {
  if (p.coffresOuverts.includes(coffreId)) return p;
  return { ...p, coffresOuverts: [...p.coffresOuverts, coffreId] };
}

export function totalEtoiles(p: ProgressionEnfant): number {
  const etapes = Object.values(p.etapes).reduce((somme, r) => somme + r.etoiles, 0);
  return etapes + p.coffresOuverts.length * ETOILES_COFFRE;
}

/** Jours d'affilée jusqu'à aujourd'hui (ou hier, si l'enfant n'a pas encore joué aujourd'hui). */
export function serieDeJours(jours: readonly string[], aujourdhui: string): number {
  const actifs = new Set(jours);
  let jour = actifs.has(aujourdhui) ? aujourdhui : decaler(aujourdhui, -1);
  let serie = 0;
  while (actifs.has(jour)) {
    serie++;
    jour = decaler(jour, -1);
  }
  return serie;
}

/** Nombre de jours depuis la dernière activité, ou null si l'enfant n'a jamais joué. */
export function joursDepuisDerniereActivite(jours: readonly string[], aujourdhui: string): number | null {
  if (jours.length === 0) return null;
  const dernier = [...jours].sort().at(-1)!;
  return Math.max(0, joursEntre(dernier, aujourdhui));
}

/** Secondes passées sur les 7 derniers jours (aujourd'hui compris). */
export function tempsDeLaSemaine(p: ProgressionEnfant, aujourdhui: string): number {
  return Object.entries(p.tempsParJour)
    .filter(([j]) => {
      const ecart = joursEntre(j, aujourdhui);
      return ecart >= 0 && ecart < 7;
    })
    .reduce((somme, [, s]) => somme + s, 0);
}

function decaler(jour: string, nombre: number): string {
  const [y, m, d] = jour.split('-').map(Number);
  return dateLocale(new Date(y, m - 1, d + nombre));
}

// --- Chemin du parcours ---

export type EtatNoeud = 'reussie' | 'enCours' | 'verrouillee';

export type Noeud =
  | { type: 'etape'; id: string; numero: number; titre: string; uniteId: string; etat: EtatNoeud }
  | { type: 'coffre'; id: string; uniteId: string; etat: EtatNoeud };

/**
 * Le chemin d'un thème : les étapes de chaque unité puis son coffre.
 * Le premier nœud pas encore franchi est « en cours », les suivants sont
 * verrouillés. Les nœuds franchis restent rejouables.
 */
export function cheminDuTheme(theme: Theme, p: ProgressionEnfant): Noeud[] {
  const noeuds: Noeud[] = [];
  let numero = 0;
  let enCoursPlace = false;
  const etat = (franchi: boolean): EtatNoeud => {
    if (franchi) return 'reussie';
    if (!enCoursPlace) {
      enCoursPlace = true;
      return 'enCours';
    }
    return 'verrouillee';
  };
  for (const unite of theme.unites) {
    for (const etape of unite.etapes) {
      numero++;
      noeuds.push({
        type: 'etape',
        id: etape.id,
        numero,
        titre: etape.titre,
        uniteId: unite.id,
        etat: etat(enCoursPlace ? false : etape.id in p.etapes),
      });
    }
    noeuds.push({
      type: 'coffre',
      id: unite.coffre,
      uniteId: unite.id,
      etat: etat(enCoursPlace ? false : p.coffresOuverts.includes(unite.coffre)),
    });
  }
  return noeuds;
}

/** Graine d'une partie : nouvelle à chaque fois qu'on rejoue, mais reproductible. */
export function graineDePartie(profilId: string, etapeId: string, fois: number): number {
  return graineDepuisTexte(`${profilId}:${etapeId}:${fois}`);
}
