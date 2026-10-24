// Règles FALC (Facile à lire et à comprendre) vérifiables par le code :
// des phrases courtes, une idée par phrase.
/** Nombre maximal de mots dans une phrase FALC. */
export const MOTS_PAR_PHRASE_FALC = 12;

/** Découpe un texte en phrases (le point, le point d'interrogation, d'exclamation ou les deux-points ferment une idée). */
// Un passage cité entre guillemets (une phrase du texte, un mot) compte comme un seul mot.
export function phrasesDe(texte: string): string[] {
  return texte
    .replace(/«[^»]*»/g, 'X')
    .split(/(?<=[.!?:])\s+/)
    .map((p) => p.trim())
    .filter((p) => p !== '');
}

export function nombreDeMots(phrase: string): number {
  return phrase.split(/\s+/).filter((m) => /[\p{L}\d]/u.test(m)).length;
}

/** Les phrases trop longues pour le FALC (vide si le texte respecte la règle). */
export function phrasesTropLongues(texte: string, max = MOTS_PAR_PHRASE_FALC): string[] {
  return phrasesDe(texte).filter((p) => nombreDeMots(p) > max);
}
