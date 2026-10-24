// Coloration syllabique : lecture des découpages saisis à la main dans la banque
// `src/contenu/syllabes.ts`. Aucun algorithme de césure : il découpe l'écrit,
// pas les syllabes orales qu'on entend en lisant.
//
// Notation : syllabes orales séparées par « - », lettres muettes entre
// parenthèses. « cha-peau », « cha(t) », « lu-net(tes) », « to-mat(e) ».
import { SYLLABES } from '@/contenu/syllabes';

export interface MorceauSyllabe {
  texte: string;
  /** Rang de la syllabe dans le mot (pour alterner les couleurs). */
  syllabe: number;
  muette: boolean;
}

/** Découpe une notation (« lu-net(tes) ») en morceaux colorables. */
export function lireNotation(notation: string): MorceauSyllabe[] {
  const morceaux: MorceauSyllabe[] = [];
  let syllabe = 0;
  let courant = '';
  let muette = false;
  const pousser = () => {
    if (courant) morceaux.push({ texte: courant, syllabe, muette });
    courant = '';
  };
  for (const c of notation) {
    if (c === '-') {
      pousser();
      syllabe++;
    } else if (c === '(') {
      pousser();
      muette = true;
    } else if (c === ')') {
      pousser();
      muette = false;
    } else {
      courant += c;
    }
  }
  pousser();
  return morceaux;
}

/** Le mot que recompose une notation, sans tirets ni parenthèses. */
export function motDeNotation(notation: string): string {
  return notation.replace(/[-()]/g, '');
}

/**
 * Découpage d'un mot tel qu'il est écrit (majuscule comprise), ou null s'il
 * n'est pas dans la banque : il s'affiche alors sans couleur.
 */
export function decouperMot(mot: string): MorceauSyllabe[] | null {
  const notation = SYLLABES[mot.toLowerCase()];
  if (!notation) return null;
  // On reprend les lettres du mot affiché, pour garder sa majuscule.
  let i = 0;
  return lireNotation(notation).map((m) => {
    const texte = mot.slice(i, i + m.texte.length);
    i += m.texte.length;
    return { ...m, texte };
  });
}

/** Un morceau de texte : un mot (lettres seulement) ou ce qui le sépare. */
export interface Jeton {
  texte: string;
  debut: number;
  estMot: boolean;
}

/** Découpe un texte en mots et séparateurs ; l'apostrophe et le trait d'union séparent les mots. */
export function decouperTexte(texte: string): Jeton[] {
  const jetons: Jeton[] = [];
  for (const m of texte.matchAll(/\p{L}+|[^\p{L}]+/gu)) {
    jetons.push({ texte: m[0], debut: m.index, estMot: /\p{L}/u.test(m[0]) });
  }
  return jetons;
}

/** Les mots d'un texte, en minuscules (pour vérifier que la banque les connaît tous). */
export function motsDe(texte: string): string[] {
  return decouperTexte(texte)
    .filter((j) => j.estMot)
    .map((j) => j.texte.toLowerCase());
}
