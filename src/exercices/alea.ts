// Générateur pseudo-aléatoire avec graine (algorithme mulberry32).
// Une même graine redonne toujours la même suite : on peut rejouer un exercice
// à l'identique et écrire des tests reproductibles.

export interface Alea {
  /** Nombre décimal dans [0, 1[. */
  suivant(): number;
  /** Entier compris entre min et max inclus. */
  entier(min: number, max: number): number;
  /** Un élément du tableau. */
  choix<T>(elements: readonly T[]): T;
  /** Copie mélangée du tableau (Fisher-Yates). */
  melanger<T>(elements: readonly T[]): T[];
}

export function creerAlea(graine: number): Alea {
  let etat = graine >>> 0;
  const suivant = () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const entier = (min: number, max: number) => min + Math.floor(suivant() * (max - min + 1));
  return {
    suivant,
    entier,
    choix: (elements) => elements[entier(0, elements.length - 1)],
    melanger: (elements) => {
      const copie = [...elements];
      for (let i = copie.length - 1; i > 0; i--) {
        const j = entier(0, i);
        [copie[i], copie[j]] = [copie[j], copie[i]];
      }
      return copie;
    },
  };
}

/** Graine entière tirée d'un texte (hachage FNV-1a), par exemple « profil:etape:3 ». */
export function graineDepuisTexte(texte: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
