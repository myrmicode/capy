// Fabrique d'unités de parcours : quelques étapes, une révision, un coffre.
import type { JeuId } from '@/jeux/registre';

import type { Unite } from './parcours';

export type EtapeCourte = readonly [
  titre: string,
  modeles: readonly string[],
  jeux: readonly JeuId[],
  questions: number,
];

/** Une unité dont les étapes sont numérotées d'après son identifiant (« ce1-rp-u1-1 »…). */
export function unite(id: string, titre: string, objectif: string, etapes: readonly EtapeCourte[]): Unite {
  return {
    id,
    titre,
    objectif,
    coffre: `${id}-coffre`,
    etapes: etapes.map(([t, modeles, jeux, nombreQuestions], i) => ({
      id: `${id}-${i + 1}`,
      titre: t,
      modeles,
      jeux,
      nombreQuestions,
    })),
  };
}
