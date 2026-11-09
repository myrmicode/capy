// Les tables de Capy : l'enfant choisit une table (ou toutes), et répond à
// 10 multiplications, 7 secondes chacune. Temps dépassé ou réponse fausse :
// Capy montre la bonne réponse et on passe à la suivante. À la fin, le taux de
// réussite et les calculs à revoir. On se compare à soi-même, jamais aux autres.
// En mode calme, pas de minuteur : l'enfant répond à son rythme. Fonctions pures.
import type { Classe } from '@/config/classes';
import { creerAlea } from '@/exercices';

import type { ResultatChrono } from './progression';

export const QUESTIONS_TABLES = 10;
export const DELAI_TABLES_SECONDES = 7;
export const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Une table de 1 à 10, ou toutes les tables mélangées. */
export type ChoixTables = number | 'toutes';

export interface QuestionTable {
  a: number;
  b: number;
}

/** Les tables commencent au CE1 : au CP, on n'en propose pas. */
export function tablesOuvertes(classe: Classe): boolean {
  return classe !== 'CP';
}

/** La clé du record dans la progression. */
export function cleTables(choix: ChoixTables): string {
  return choix === 'toutes' ? 'toutes' : `table-${choix}`;
}

export function libelleTables(choix: ChoixTables): string {
  return choix === 'toutes' ? 'Toutes les tables' : `La table de ${choix}`;
}

export const resultat = (q: QuestionTable) => q.a * q.b;

/**
 * Les 10 questions d'une partie, reproductibles avec la graine.
 * - Une table : de « 7 × 1 » à « 7 × 10 », dans l'ordre ou dans le désordre.
 * - Toutes les tables : 10 calculs tirés au hasard, jamais deux fois le même
 *   (ni « 3 × 4 » puis « 4 × 3 »), toujours dans le désordre.
 */
export function questionsTables(choix: ChoixTables, desordre: boolean, graine: number): QuestionTable[] {
  const alea = creerAlea(graine);
  if (choix !== 'toutes') {
    const dansLOrdre = TABLES.map((b) => ({ a: choix, b }));
    return desordre ? alea.melanger(dansLOrdre) : dansLOrdre;
  }
  const paires: QuestionTable[] = [];
  for (const a of TABLES) for (const b of TABLES) if (a <= b) paires.push({ a, b });
  // Au plus un calcul avec 1 : plusieurs rendraient la partie trop facile.
  const melangees = alea.melanger(paires);
  const choisies: QuestionTable[] = [];
  let avecUn = 0;
  for (const p of melangees) {
    if (choisies.length === QUESTIONS_TABLES) break;
    if (p.a === 1 || p.b === 1) {
      if (avecUn >= 1) continue;
      avecUn++;
    }
    // Le plus grand facteur en premier ou en second, au hasard : « 8 × 3 » comme « 3 × 8 ».
    choisies.push(alea.entier(0, 1) === 0 ? p : { a: p.b, b: p.a });
  }
  return choisies;
}

/** Le taux de réussite, en pourcentage entier. */
export function tauxReussite(justes: number, total: number): number {
  return total === 0 ? 0 : Math.round((justes / total) * 100);
}

/** Ce que dit Capy à la fin de la partie. */
export function messageTables(
  justes: number,
  total: number,
  avant: ResultatChrono | undefined,
  prenom: string,
): string {
  if (justes === total) return `Parfait, ${prenom} ! Tout juste : tu connais cette table par cœur.`;
  if (!avant || avant.series === 0)
    return `Bravo ${prenom} ! ${justes} sur ${total} pour commencer. Rejoue tes erreurs pour les retenir.`;
  if (justes > avant.record)
    return `Nouveau record, ${prenom} ! ${justes} sur ${total}, ${justes - avant.record} de plus qu’avant.`;
  if (justes === avant.record) return `Bravo ${prenom} ! Tu égales ton record : ${justes} sur ${total}.`;
  return `Bien joué, ${prenom} ! Ton record est de ${avant.record} sur ${total} : rejoue tes erreurs, tu le battras.`;
}
