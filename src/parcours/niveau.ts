// Niveau des exercices d'une compétence, d'après la toile.
//
// On part du niveau de l'enfant et on l'emmène jusqu'au niveau visé (+++) :
// - le niveau d'une étape suit la toile du jour de la compétence (+ → 1, ++ → 2,
//   +++ → 3). Chaque réussite fait monter la toile, donc la difficulté, et une
//   étape difficile la fait redescendre doucement, sans pénalité ;
// - dans chaque étape, la dernière question est un « défi » d'un cran au-dessus.
import type { DomaineId } from '@/config/domaines';
import { NIVEAU_CIBLE, type NiveauDifficulte } from '@/exercices';
import { symboleDe, type ToileEnfant } from '@/toile/niveaux';

const NIVEAU_DU_SYMBOLE = { '+': 1, '++': 2, '+++': 3 } as const;

export function niveauPourDomaine(toile: ToileEnfant | undefined, domaine: DomaineId): NiveauDifficulte {
  const valeur = toile?.actuelle[domaine] ?? toile?.septembre[domaine];
  return valeur === undefined ? 1 : NIVEAU_DU_SYMBOLE[symboleDe(valeur)];
}

/** Niveau de chaque question d'une étape : celui de l'étape, et un défi au-dessus pour la dernière. */
export function niveauxDesQuestions(niveau: NiveauDifficulte, nombreQuestions: number): NiveauDifficulte[] {
  return Array.from({ length: nombreQuestions }, (_, i) =>
    i === nombreQuestions - 1 && niveau < NIVEAU_CIBLE ? ((niveau + 1) as NiveauDifficulte) : niveau,
  );
}
