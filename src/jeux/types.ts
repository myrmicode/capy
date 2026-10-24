import type { Exercice } from '@/exercices';

/** Ce que reçoit chaque mini-jeu. */
export interface PropsJeu {
  exercice: Exercice;
  /** Faux pendant l'affichage du panneau Bravo / Presque. */
  actif: boolean;
  onRepondre: (juste: boolean) => void;
}
