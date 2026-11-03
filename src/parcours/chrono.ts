// Le chrono de Capy : une minute pour répondre au plus de calculs possible.
// Aux évaluations, « Calculer rapidement » et les tables se passent en temps
// limité ; ici, on bat seulement son propre record. Une erreur ne fait rien
// perdre : Capy montre la bonne réponse et passe au calcul suivant.
// Pas de chrono en mode calme. Fonctions pures.
import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';
import type { Theme } from '@/config/parcours';
import {
  creerAlea,
  graineDepuisTexte,
  modelesPour,
  type Exercice,
  type ModeleExercice,
  type NiveauDifficulte,
} from '@/exercices';
import type { ToileEnfant } from '@/toile/niveaux';

import type { ResultatChrono } from './progression';
import { serieEntrainement, themesEntrainement, themesProposes } from './selection';

export const DUREE_CHRONO_SECONDES = 60;
/** Les compétences où la vitesse compte : les faits numériques à connaître par cœur. */
export const DOMAINES_CHRONO: readonly DomaineId[] = ['calcul-mental', 'tables-addition', 'tables-multiplication'];

/** Les thèmes de calcul ouverts à l'enfant (dans le parcours ou en entraînement libre). */
export function themesChrono(classe: Classe, toile: ToileEnfant | undefined): Theme[] {
  // Un thème est soit dans le parcours (+ ou ++), soit en entraînement libre (+++) : jamais les deux.
  return [...themesProposes(classe, toile), ...themesEntrainement(classe, toile)].filter((t) =>
    DOMAINES_CHRONO.includes(t.domaine),
  );
}

/** Le n-ième calcul d'une série, reproductible : on ne revoit pas deux fois de suite le même. */
export function calculDuChrono(
  theme: Theme,
  classe: Classe,
  niveau: NiveauDifficulte,
  graine: number,
  n: number,
  precedent?: Exercice,
): Exercice {
  const voulus = serieEntrainement(theme).modeles;
  const modeles = modelesPour(theme.domaine, classe).filter(
    (m): m is ModeleExercice => voulus.includes(m.id) && 'operations' in m,
  );
  const alea = creerAlea(graineDepuisTexte(`${graine}:${n}`));
  for (let essai = 0; essai < 50; essai++) {
    const ex = alea.choix(modeles).generer(classe, alea.entier(0, 2 ** 31 - 1), { niveau });
    if (ex.enonce !== precedent?.enonce) return ex;
  }
  return alea.choix(modeles).generer(classe, alea.entier(0, 2 ** 31 - 1), { niveau });
}

/** Ce que dit Capy à la fin de la minute : on se compare à soi-même, jamais aux autres. */
export function messageChrono(justes: number, avant: ResultatChrono | undefined, prenom: string): string {
  if (!avant || avant.series === 0)
    return `Bravo ${prenom} ! ${justes} bonne${justes > 1 ? 's' : ''} réponse${justes > 1 ? 's' : ''} : c’est ton premier record.`;
  if (justes > avant.record)
    return `Nouveau record, ${prenom} ! ${justes} bonnes réponses, ${justes - avant.record} de plus qu’avant.`;
  if (justes === avant.record) return `Bravo ${prenom} ! Tu égales ton record : ${justes} bonnes réponses.`;
  return `Bien joué, ${prenom} ! ${justes} bonne${justes > 1 ? 's' : ''} réponse${justes > 1 ? 's' : ''}. Ton record est de ${avant.record} : tu le battras une autre fois.`;
}
