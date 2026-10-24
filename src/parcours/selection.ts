// Choix des thèmes proposés à l'enfant, d'après les toiles des fiches de l'école.
//
// Règles :
// - aucun exercice sans résultat de la toile : un thème n'est proposé que si la
//   fiche de sa matière a été saisie ;
// - on travaille les difficultés : seuls les axes notés + ou ++ sur la fiche
//   (la référence de septembre) donnent un thème ; un axe déjà à +++ n'est pas proposé ;
// - les axes déjà à +++ se rejouent en entraînement libre (séries courtes) ;
// - du plus fragile au moins fragile, d'après la toile du jour (qui évolue avec
//   les exercices). Un thème reste proposé jusqu'au bout, même si l'axe progresse.
import type { Classe } from '@/config/classes';
import { domaineDe } from '@/config/domaines';
import { themesDe, type EtapeTheme, type Theme } from '@/config/parcours';
import { ficheSaisie, symboleDe, type ToileEnfant } from '@/toile/niveaux';

export function themesProposes(classe: Classe, toile: ToileEnfant | undefined): Theme[] {
  if (!toile) return [];
  const proposes = themesDe(classe).filter((t) => {
    const domaine = domaineDe(classe, t.domaine);
    if (!domaine || !ficheSaisie(toile, domaine.matiere)) return false;
    const niveauFiche = toile.septembre[t.domaine];
    return niveauFiche !== undefined && symboleDe(niveauFiche) !== '+++';
  });
  const niveau = (t: Theme) => toile.actuelle[t.domaine] ?? toile.septembre[t.domaine] ?? 1;
  // Tri stable : à niveau égal, on garde l'ordre du parcours.
  return proposes.sort((a, b) => niveau(a) - niveau(b));
}

export function themeEstPropose(classe: Classe, toile: ToileEnfant | undefined, themeId: string): boolean {
  return themesProposes(classe, toile).some((t) => t.id === themeId);
}

/** Nombre de questions d'une série d'entraînement libre. */
export const QUESTIONS_SERIE = 5;

/**
 * Entraînement libre : les compétences déjà à +++ sur la fiche de septembre ne
 * sont pas dans le parcours, mais l'enfant peut les rejouer en séries courtes.
 * Comme pour le parcours, rien sans la fiche de la matière.
 */
export function themesEntrainement(classe: Classe, toile: ToileEnfant | undefined): Theme[] {
  if (!toile) return [];
  return themesDe(classe).filter((t) => {
    const domaine = domaineDe(classe, t.domaine);
    if (!domaine || !ficheSaisie(toile, domaine.matiere)) return false;
    const niveauFiche = toile.septembre[t.domaine];
    return niveauFiche !== undefined && symboleDe(niveauFiche) === '+++';
  });
}

export function themeEnEntrainement(classe: Classe, toile: ToileEnfant | undefined, themeId: string): boolean {
  return themesEntrainement(classe, toile).some((t) => t.id === themeId);
}

/** Une série d'entraînement : tous les modèles et tous les mini-jeux du thème, sans étapes ni coffre. */
export function serieEntrainement(theme: Theme): EtapeTheme {
  const etapes = theme.unites.flatMap((u) => u.etapes);
  return {
    id: `entrainement:${theme.id}`,
    titre: theme.titre,
    modeles: [...new Set(etapes.flatMap((e) => e.modeles))],
    jeux: [...new Set(etapes.flatMap((e) => e.jeux))],
    nombreQuestions: QUESTIONS_SERIE,
  };
}
