// Vitesse de réponse, pour les parents : quand une notion devient automatique,
// les réponses justes arrivent plus vite. On compare l'enfant à lui-même (ses
// premières étapes et ses dernières), jamais à d'autres enfants.
import type { MesureVitesse } from '@/parcours/progression';

/** Nombre de mesures (étapes terminées) à partir duquel on parle d'une tendance. */
export const MESURES_MIN_TENDANCE = 4;
/** Écart (en part du temps de départ) en dessous duquel le temps est dit stable. */
const ECART_STABLE = 0.15;

export interface TendanceVitesse {
  /** Temps moyen des premières étapes, en secondes. */
  debut: number;
  /** Temps moyen des dernières étapes, en secondes. */
  recent: number;
  sens: 'plusRapide' | 'stable' | 'plusLent';
}

const moyenne = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function tendanceVitesse(mesures: readonly MesureVitesse[] | undefined): TendanceVitesse | null {
  if (!mesures || mesures.length < MESURES_MIN_TENDANCE) return null;
  const k = Math.min(3, Math.floor(mesures.length / 2));
  const debut = moyenne(mesures.slice(0, k).map((m) => m.secondes));
  const recent = moyenne(mesures.slice(-k).map((m) => m.secondes));
  const sens =
    recent < debut * (1 - ECART_STABLE) ? 'plusRapide' : recent > debut * (1 + ECART_STABLE) ? 'plusLent' : 'stable';
  return { debut, recent, sens };
}

const secondes = (s: number) => `${Math.max(1, Math.round(s))} s`;

/** Une phrase pour l'espace parent ; null tant qu'il n'y a pas assez d'étapes. */
export function phraseVitesse(mesures: readonly MesureVitesse[] | undefined): string | null {
  const t = tendanceVitesse(mesures);
  if (!t) return null;
  if (t.sens === 'plusRapide')
    return `Réponses justes en ${secondes(t.recent)} en moyenne, contre ${secondes(t.debut)} au début : ça devient automatique.`;
  if (t.sens === 'plusLent')
    return `Réponses justes en ${secondes(t.recent)} en moyenne (${secondes(t.debut)} au début) : les exercices sont plus exigeants, c’est normal de prendre son temps.`;
  return `Réponses justes en ${secondes(t.recent)} en moyenne, comme au début.`;
}
