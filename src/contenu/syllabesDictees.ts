// Les syllabes que Capy dicte en CE1 (« Écrire des syllabes ») : chacune ne
// s'écrit que d'une seule façon simple. On évite donc les sons à plusieurs
// écritures (an, en, in, ain, au, eau) et les lettres qui changent de son
// (c et g devant e et i).
// Niveaux : 1 = consonne et voyelle (ma, ti) ; 2 = sons à deux lettres (chou,
// moi, ton) ; 3 = deux consonnes (bra, clou) ou une consonne à la fin (par, sol).
// À FAIRE RELIRE PAR UN ENSEIGNANT.

const CONSONNES = ['b', 'd', 'f', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v'];
const VOYELLES = ['a', 'i', 'o', 'u', 'é'];
const SONS_A_DEUX_LETTRES = ['ou', 'oi', 'on'];
const GROUPES = ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'vr', 'bl', 'cl', 'fl', 'gl', 'pl'];
const FINALES = ['r', 'l'];

const croiser = (debuts: readonly string[], fins: readonly string[]) => debuts.flatMap((d) => fins.map((f) => d + f));

export const SYLLABES_DICTEES: Readonly<Record<1 | 2 | 3, readonly string[]>> = {
  1: croiser(CONSONNES, VOYELLES),
  2: [
    ...croiser(['ch'], ['a', 'i', 'o', 'u']),
    // « bon », « mon »… : « on » s'écrit « om » seulement devant b et p, jamais en fin de syllabe.
    ...croiser(CONSONNES, SONS_A_DEUX_LETTRES),
  ],
  3: [
    ...croiser(GROUPES, [...VOYELLES, 'ou']),
    ...croiser(['b', 'd', 'f', 'm', 'p', 's', 't', 'v'], ['a', 'i', 'o', 'u']).flatMap((cv) =>
      FINALES.map((fin) => cv + fin),
    ),
  ],
};

/** Toutes les syllabes dictées, sans doublon (pour la banque de la coloration syllabique). */
export const TOUTES_LES_SYLLABES_DICTEES: readonly string[] = [
  ...new Set([...SYLLABES_DICTEES[1], ...SYLLABES_DICTEES[2], ...SYLLABES_DICTEES[3]]),
];
