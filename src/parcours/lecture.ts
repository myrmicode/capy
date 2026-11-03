// Lire à deux : l'enfant lit à voix haute pendant une minute, l'adulte touche
// les mots mal lus puis le dernier mot lu. Comme pour la lecture à voix haute
// des évaluations, on compte les mots bien lus en une minute. Fonctions pures.
// Rien n'est enregistré que des nombres : jamais la voix.
import type { Classe } from '@/config/classes';
import { textesDe, texteLecture, type TexteLecture } from '@/contenu/textesLecture';

import { decaler, type MesureLecture, type ProgressionEnfant } from './progression';

/** La lecture dure une minute. */
export const DUREE_LECTURE_SECONDES = 60;
/** Lecture répétée : on propose de relire le même texte jusqu'à ce nombre de fois. */
export const RELECTURES_CONSEILLEES = 3;
/** Au-delà, on propose un nouveau texte plutôt que de reprendre l'ancien. */
const JOURS_AVANT_NOUVEAU_TEXTE = 7;

/** Le texte découpé tel qu'on l'affiche : un morceau par mot, avec sa ponctuation. */
export function morceauxDuTexte(texte: string): string[] {
  return texte.split(/\s+/).filter((m) => m !== '');
}

/** Un morceau compte comme un mot s'il contient une lettre ou un chiffre (pas « – » ni « : » seuls). */
export function estUnMot(morceau: string): boolean {
  return /[\p{L}\d]/u.test(morceau);
}

export function nombreDeMots(texte: string): number {
  return morceauxDuTexte(texte).filter(estUnMot).length;
}

/**
 * Mots bien lus par minute. `dernier` est le numéro du dernier morceau lu ;
 * les erreurs après lui ne comptent pas. Si l'enfant finit avant la minute, on
 * ramène à une minute.
 */
export function mesurerLecture(
  texte: string,
  dernier: number,
  erreurs: ReadonlySet<number>,
  secondes: number,
): { motsParMinute: number; erreurs: number; motsLus: number } {
  const morceaux = morceauxDuTexte(texte);
  const fin = Math.min(Math.max(dernier, -1), morceaux.length - 1);
  let motsLus = 0;
  let fautes = 0;
  for (let i = 0; i <= fin; i++) {
    if (!estUnMot(morceaux[i])) continue;
    motsLus++;
    if (erreurs.has(i)) fautes++;
  }
  const duree = Math.min(DUREE_LECTURE_SECONDES, Math.max(1, secondes));
  const bienLus = Math.max(0, motsLus - fautes);
  return { motsParMinute: Math.round((bienLus * 60) / duree), erreurs: fautes, motsLus };
}

/** La lecture la plus récente, tous textes confondus. */
export function derniereLecture(
  p: ProgressionEnfant,
): { texteId: string; titre: string; mesure: MesureLecture } | null {
  let meilleure: { texteId: string; titre: string; mesure: MesureLecture } | null = null;
  for (const [texteId, mesures] of Object.entries(p.lectures ?? {})) {
    const mesure = mesures.at(-1);
    const texte = texteLecture(texteId);
    if (!mesure || !texte) continue;
    if (!meilleure || mesure.jour >= meilleure.mesure.jour) meilleure = { texteId, titre: texte.titre, mesure };
  }
  return meilleure;
}

/**
 * Le texte que Capy propose : le même que la dernière fois tant qu'il n'a pas
 * été lu trois fois (et pas il y a trop longtemps), sinon le premier pas
 * encore lu, sinon le moins lu.
 */
export function texteConseille(classe: Classe, p: ProgressionEnfant, aujourdhui: string): TexteLecture | undefined {
  const textes = textesDe(classe);
  const lus = (t: TexteLecture) => p.lectures?.[t.id] ?? [];
  const derniere = derniereLecture(p);
  const enCours = derniere && textes.find((t) => t.id === derniere.texteId);
  if (
    enCours &&
    lus(enCours).length < RELECTURES_CONSEILLEES &&
    derniere.mesure.jour >= decaler(aujourdhui, -JOURS_AVANT_NOUVEAU_TEXTE)
  )
    return enCours;
  const jamaisLu = textes.find((t) => lus(t).length === 0);
  if (jamaisLu) return jamaisLu;
  return [...textes].sort((a, b) => lus(a).length - lus(b).length)[0];
}

/** Ce que Capy dit après la lecture : on se compare à soi-même, jamais aux autres. */
export function messageLecture(mesures: readonly MesureLecture[], prenom: string): string {
  const derniere = mesures.at(-1);
  if (!derniere) return '';
  const avant = mesures.at(-2);
  if (!avant) return `Bravo ${prenom} ! Relis ce texte demain : tu verras, ça ira encore mieux.`;
  const ecart = derniere.motsParMinute - avant.motsParMinute;
  if (ecart > 0)
    return `Bravo ${prenom} ! ${ecart} mot${ecart > 1 ? 's' : ''} de plus que la dernière fois. Ta lecture devient fluide.`;
  if (ecart === 0) return `Bravo ${prenom} ! Autant de mots que la dernière fois, et le texte devient familier.`;
  return `Bravo ${prenom} ! Certains jours, on lit plus lentement : c’est normal. L’important, c’est de lire souvent.`;
}
