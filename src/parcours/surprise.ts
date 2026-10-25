// Thème surprise : quand une unité est finie (coffre ouvert), Capy propose une
// série courte d'un autre thème de la classe, de préférence jamais essayé.
// Seulement dans une matière dont la fiche a été saisie : rien sans la toile.
import type { Classe } from '@/config/classes';
import { domaineDe } from '@/config/domaines';
import { themesDe, type Theme } from '@/config/parcours';
import { graineDepuisTexte } from '@/exercices';
import { ficheSaisie, type ToileEnfant } from '@/toile/niveaux';

import type { ProgressionEnfant } from './progression';

/** Les thèmes qui peuvent être une surprise : ceux des matières dont la fiche est saisie. */
export function themesSurprise(classe: Classe, toile: ToileEnfant | undefined): Theme[] {
  return themesDe(classe).filter((t) => {
    const domaine = domaineDe(classe, t.domaine);
    return domaine !== undefined && ficheSaisie(toile, domaine.matiere);
  });
}

function dejaEssaye(t: Theme, p: ProgressionEnfant): boolean {
  const etapes = t.unites.flatMap((u) => u.etapes.map((e) => e.id));
  return etapes.some((id) => id in p.etapes) || (p.entrainement?.[t.id]?.series ?? 0) > 0;
}

/** Le thème surprise proposé après un coffre : toujours le même pour un même coffre. */
export function themeSurprise(
  classe: Classe,
  toile: ToileEnfant | undefined,
  p: ProgressionEnfant,
  coffreId: string,
  themeActuelId: string,
): Theme | undefined {
  const possibles = themesSurprise(classe, toile).filter((t) => t.id !== themeActuelId);
  const jamais = possibles.filter((t) => !dejaEssaye(t, p));
  const liste = jamais.length > 0 ? jamais : possibles;
  if (liste.length === 0) return undefined;
  return liste[graineDepuisTexte(coffreId) % liste.length];
}
