// Contrôle parental : un nombre écrit en lettres (entre 1 000 et 99 999), à taper
// en chiffres. Un enfant de 5 à 9 ans ne le lit pas facilement, un adulte si.
// Pas de blocage après une erreur : on propose simplement un autre nombre.
import type { Alea } from '@/exercices';

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
];
const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** 0 à 99, orthographe traditionnelle (vingt et un, soixante-dix, quatre-vingts…). */
function moinsDeCent(n: number, finale: boolean): string {
  if (n < 17) return UNITES[n];
  if (n < 20) return `dix-${UNITES[n - 10]}`;
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 7 || d === 9) {
    const base = d === 7 ? 'soixante' : 'quatre-vingt';
    const reste = 10 + u;
    if (d === 7 && u === 1) return 'soixante et onze';
    return `${base}-${moinsDeCent(reste, false)}`;
  }
  if (d === 8) return u === 0 ? (finale ? 'quatre-vingts' : 'quatre-vingt') : `quatre-vingt-${UNITES[u]}`;
  if (u === 0) return DIZAINES[d];
  if (u === 1) return `${DIZAINES[d]} et un`;
  return `${DIZAINES[d]}-${UNITES[u]}`;
}

/** 0 à 999. `finale` : le nombre n'est pas suivi de « mille » (accord de cent et vingt). */
function moinsDeMille(n: number, finale: boolean): string {
  const c = Math.floor(n / 100);
  const reste = n % 100;
  const parties: string[] = [];
  if (c === 1) parties.push('cent');
  else if (c > 1) parties.push(reste === 0 && finale ? `${UNITES[c]} cents` : `${UNITES[c]} cent`);
  if (reste > 0 || c === 0) parties.push(moinsDeCent(reste, finale));
  return parties.join(' ');
}

/** Écrit un entier de 0 à 999 999 en lettres. */
export function nombreEnLettres(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new Error(`Nombre hors limites : ${n}`);
  const milliers = Math.floor(n / 1000);
  const reste = n % 1000;
  if (milliers === 0) return moinsDeMille(reste, true);
  const debut = milliers === 1 ? 'mille' : `${moinsDeMille(milliers, false)} mille`;
  return reste === 0 ? debut : `${debut} ${moinsDeMille(reste, true)}`;
}

export interface DefiParental {
  enLettres: string;
  reponse: string;
}

export function nouveauDefi(alea: Alea): DefiParental {
  const n = alea.entier(1_000, 99_999);
  return { enLettres: nombreEnLettres(n), reponse: String(n) };
}
