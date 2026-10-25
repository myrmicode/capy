// Révisions espacées. Une question qui a demandé plusieurs essais revient un
// jour plus tard, puis 3 jours, puis 7 jours après chaque réussite du premier
// coup. Elle revient toujours sous une autre forme (un nouvel exercice du même
// modèle) : l'enfant retravaille la compétence, il ne mémorise pas une réponse.
// Jamais présenté comme un échec : à l'écran, c'est un « Petit rappel ».
//
// Fonctions pures : elles renvoient de nouvelles révisions sans rien modifier.
import type { DomaineId } from '@/config/domaines';
import type { NiveauDifficulte } from '@/exercices';
import type { JeuId } from '@/jeux/registre';

import { decaler } from './progression';

export interface ARevoir {
  modeleId: string;
  jeu: JeuId;
  domaine: DomaineId;
  niveau: NiveauDifficulte;
  /** Jour (AAAA-MM-JJ) à partir duquel la révision est proposée. */
  revoirLe: string;
  /** Rang dans INTERVALLES_JOURS de l'écart qui a mené à revoirLe. */
  palier: number;
}

/** Écarts successifs, en jours, entre deux révisions réussies. */
export const INTERVALLES_JOURS = [1, 3, 7] as const;
/** Au-delà, les révisions les plus anciennes sont oubliées. */
export const REVISIONS_MAX = 30;

/** Une question posée dans une étape, telle que la révision la retient. */
export interface QuestionRevisee {
  modeleId: string;
  jeu: JeuId;
  domaine: DomaineId;
  niveau: NiveauDifficulte;
  /** La question demandait-elle plusieurs essais ? */
  rate: boolean;
  /** Était-ce une révision ? */
  revision: boolean;
}

export function cleRevision(modeleId: string, jeu: JeuId): string {
  return `${modeleId}|${jeu}`;
}

/**
 * Met à jour les révisions après une étape :
 * - une question ratée (révision ou non) revient demain ;
 * - une révision réussie du premier coup revient plus tard, puis disparaît
 *   après le dernier palier.
 */
export function noterRevisions(
  aRevoir: Record<string, ARevoir> | undefined,
  questions: readonly QuestionRevisee[],
  aujourdhui: string,
): Record<string, ARevoir> {
  const suivantes = { ...aRevoir };
  for (const q of questions) {
    const cle = cleRevision(q.modeleId, q.jeu);
    if (q.rate) {
      const { rate: _r, revision: _v, ...base } = q;
      // Supprimée puis remise : la plus récente est en dernier, la plus ancienne sera oubliée la première.
      delete suivantes[cle];
      suivantes[cle] = { ...base, revoirLe: decaler(aujourdhui, INTERVALLES_JOURS[0]), palier: 0 };
    } else if (q.revision && suivantes[cle]) {
      const palier = suivantes[cle].palier + 1;
      if (palier >= INTERVALLES_JOURS.length) delete suivantes[cle];
      else suivantes[cle] = { ...suivantes[cle], revoirLe: decaler(aujourdhui, INTERVALLES_JOURS[palier]), palier };
    }
  }
  const cles = Object.keys(suivantes);
  for (const cle of cles.slice(0, Math.max(0, cles.length - REVISIONS_MAX))) delete suivantes[cle];
  return suivantes;
}

/** Les révisions à proposer aujourd'hui pour une compétence, la plus en retard d'abord. */
export function revisionsDues(
  aRevoir: Record<string, ARevoir> | undefined,
  domaine: DomaineId,
  aujourdhui: string,
): ARevoir[] {
  return Object.values(aRevoir ?? {})
    .filter((r) => r.domaine === domaine && r.revoirLe <= aujourdhui)
    .sort((a, b) => a.revoirLe.localeCompare(b.revoirLe));
}

/** Réunit les révisions de deux appareils : pour une même question, la plus proche l'emporte. */
export function fusionnerRevisions(
  a: Record<string, ARevoir> | undefined,
  b: Record<string, ARevoir> | undefined,
): Record<string, ARevoir> {
  const fusion = { ...a };
  for (const [cle, r] of Object.entries(b ?? {})) {
    const autre = fusion[cle];
    if (!autre || r.revoirLe < autre.revoirLe) fusion[cle] = r;
  }
  return fusion;
}
