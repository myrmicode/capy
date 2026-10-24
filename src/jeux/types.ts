import type { Exercice, ExerciceQuelconque, ExerciceTexte } from '@/exercices';

/** Ce que reçoit chaque mini-jeu. */
export interface PropsJeu {
  exercice: ExerciceQuelconque;
  /** Faux pendant l'affichage du panneau Bravo / Presque. */
  actif: boolean;
  onRepondre: (juste: boolean) => void;
}

/** Mini-jeu qui ne travaille que sur des exercices de mathématiques. */
export type PropsJeuNombre = Omit<PropsJeu, 'exercice'> & { exercice: Exercice };

/** Mini-jeu qui ne travaille que sur des exercices de français. */
export type PropsJeuTexte = Omit<PropsJeu, 'exercice'> & { exercice: ExerciceTexte };
