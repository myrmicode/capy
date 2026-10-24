// Adapte un exercice aux réglages de l'enfant, sans changer ce qu'il évalue :
// version FALC des textes, moins de réponses proposées.
import type { DomaineId } from '@/config/domaines';
import type { ExerciceQuelconque } from '@/exercices';
import type { JeuId } from '@/jeux/registre';

import type { ReglagesEnfant } from './reglages';

/** Nombre de questions d'une étape avec « Sessions courtes ». */
export const QUESTIONS_SESSION_COURTE = 3;

/**
 * Domaines où la table ne peut pas être consultée : c'est justement la mémoire
 * des résultats qu'ils travaillent.
 */
export const DOMAINES_SANS_TABLE: readonly DomaineId[] = ['calcul-mental', 'tables-addition'];

export function nombreDeQuestions(prevu: number, reglages: ReglagesEnfant): number {
  return reglages.sessionsCourtes ? Math.min(prevu, QUESTIONS_SESSION_COURTE) : prevu;
}

/** Garde la bonne réponse et les premières erreurs typiques, dans l'ordre déjà mélangé. */
function reduire<T>(choix: readonly T[], reponse: T, garder: readonly T[], n: number): T[] {
  if (choix.length <= n) return [...choix];
  const retenus = new Set<T>([reponse, ...garder.filter((g) => g !== reponse).slice(0, n - 1)]);
  return choix.filter((c) => retenus.has(c));
}

/**
 * @param jeu Le mini-jeu qui affichera l'exercice : dans « La question perdue »,
 * la bonne question est l'une des propositions, elle reste donc la question standard.
 */
export function adapterExercice(ex: ExerciceQuelconque, r: ReglagesEnfant, jeu?: JeuId): ExerciceQuelconque {
  let adapte: ExerciceQuelconque = ex;
  if (r.falc) {
    adapte = {
      ...adapte,
      // En français, l'énoncé est la phrase étudiée : facile.enonce est le même.
      enonce: ex.facile.enonce,
      question: jeu === 'questionPerdue' ? ex.question : ex.facile.question,
      indice: ex.facile.indice,
      explication: ex.facile.explication,
    };
  }
  if (r.nombreChoix === 4) return adapte;
  const n = r.nombreChoix;
  if (adapte.nature === 'nombre') {
    return {
      ...adapte,
      choix: reduire(adapte.choix, adapte.reponse, adapte.distracteurs.map((d) => d.valeur), n),
      ...(adapte.questionsAuChoix
        ? { questionsAuChoix: reduire(adapte.questionsAuChoix, ex.question, adapte.questionsAuChoix, n) }
        : {}),
    };
  }
  // Les paniers, les wagons et les phrases à toucher gardent tout : c'est le contenu étudié.
  if (adapte.categories || adapte.segments || adapte.phrases) return adapte;
  return { ...adapte, choix: reduire(adapte.choix, adapte.reponse, adapte.distracteurs.map((d) => d.valeur), n) };
}
