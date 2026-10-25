// Défi du jour : 3 questions, pour les soirs où l'on a peu de temps.
// D'abord un petit rappel s'il y en a un à faire (voir revision.ts), puis une
// question par thème, en commençant par les difficultés de la toile. Chaque
// question vient de l'étape en cours du thème, au niveau de l'enfant.
import type { Classe } from '@/config/classes';
import type { Theme } from '@/config/parcours';
import { graineDepuisTexte } from '@/exercices';
import type { ToileEnfant } from '@/toile/niveaux';

import { genererEtape, type QuestionEtape } from './etape';
import { niveauPourDomaine } from './niveau';
import { cheminDuTheme, type ProgressionEnfant } from './progression';
import { revisionsDues } from './revision';
import { themesEntrainement, themesProposes } from './selection';

export const QUESTIONS_DEFI = 3;

/** Les thèmes du défi : les difficultés de la toile, sinon ce qui se rejoue en entraînement libre. */
export function themesDuDefi(classe: Classe, toile: ToileEnfant | undefined): Theme[] {
  const proposes = themesProposes(classe, toile);
  return proposes.length > 0 ? proposes : themesEntrainement(classe, toile);
}

/** L'étape en cours du thème, ou sa dernière étape s'il est fini. */
function etapeDuJour(theme: Theme, p: ProgressionEnfant) {
  const etapes = theme.unites.flatMap((u) => u.etapes);
  const enCours = cheminDuTheme(theme, p).find((n) => n.type === 'etape' && n.etat === 'enCours');
  return etapes.find((e) => e.id === enCours?.id) ?? etapes[etapes.length - 1];
}

export interface ParametresDefi {
  classe: Classe;
  toile: ToileEnfant | undefined;
  progression: ProgressionEnfant;
  profilId: string;
  /** Jour du défi (AAAA-MM-JJ). */
  jour: string;
  /** Nombre de fois où le défi a déjà été joué aujourd'hui : chaque partie est nouvelle. */
  partie: number;
  nombreQuestions?: number;
}

/** Compose le défi du jour ; reproductible pour un même enfant, un même jour et une même partie. */
export function genererDefi({
  classe,
  toile,
  progression,
  profilId,
  jour,
  partie,
  nombreQuestions = QUESTIONS_DEFI,
}: ParametresDefi): QuestionEtape[] {
  const themes = themesDuDefi(classe, toile);
  if (themes.length === 0) return [];
  const graine = (i: number) => graineDepuisTexte(`${profilId}:defi:${jour}:${partie}:${i}`);
  const questions: QuestionEtape[] = [];

  // Un seul petit rappel, le plus en retard, parmi les compétences du défi.
  const rappel = themes
    .flatMap((t) => revisionsDues(progression.aRevoir, t.domaine, jour).map((r) => ({ r, t })))
    .sort((a, b) => a.r.revoirLe.localeCompare(b.r.revoirLe))[0];
  if (rappel) {
    const etape = etapeDuJour(rappel.t, progression);
    // Deux questions pour que la révision soit posée en premier ; on ne garde qu'elle.
    const [q] = genererEtape({
      classe,
      domaine: rappel.t.domaine,
      graine: graine(0),
      ...etape,
      nombreQuestions: 2,
      revision: rappel.r,
    });
    if (q?.revision) questions.push(q);
  }

  for (let i = 0; questions.length < nombreQuestions && i < nombreQuestions * 3; i++) {
    const theme = themes[i % themes.length];
    const etape = etapeDuJour(theme, progression);
    // Deux questions au niveau de l'enfant (la dernière d'une étape est un cran au-dessus) : on garde la première.
    const [q] = genererEtape({
      classe,
      domaine: theme.domaine,
      graine: graine(i + 1),
      ...etape,
      nombreQuestions: 2,
      niveau: niveauPourDomaine(toile, theme.domaine),
    });
    if (q && !questions.some((d) => d.exercice.enonce === q.exercice.enonce)) questions.push(q);
  }
  return questions;
}
