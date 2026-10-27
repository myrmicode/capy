// Les nombres en lettres, et les erreurs typiques quand on passe des lettres aux
// chiffres (ou l'inverse). Sert aux exercices de numération et au contrôle parental.

const UNITES = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
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
    if (d === 7 && u === 1) return 'soixante et onze';
    return `${base}-${moinsDeCent(10 + u, false)}`;
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

/** Écrit un entier de 0 à 999 999 999 en lettres (orthographe traditionnelle). */
export function nombreEnLettres(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999) throw new Error(`Nombre hors limites\u00a0: ${n}`);
  const millions = Math.floor(n / 1_000_000);
  const milliers = Math.floor((n % 1_000_000) / 1000);
  const reste = n % 1000;
  const parties: string[] = [];
  if (millions > 0) parties.push(`${moinsDeMille(millions, true)} million${millions > 1 ? 's' : ''}`);
  if (milliers > 0) parties.push(milliers === 1 ? 'mille' : `${moinsDeMille(milliers, false)} mille`);
  if (reste > 0 || parties.length === 0) parties.push(moinsDeMille(reste, true));
  return parties.join(' ');
}

export interface ErreurNombre {
  valeur: number;
  erreur: string;
}

/**
 * Le nombre écrit « comme on l'entend », morceau après morceau :
 * trois cent quarante-deux → 30042, soixante-quatorze → 6014, quatre-vingt-trois → 4203.
 */
export function ecritureJuxtaposee(n: number): number | undefined {
  if (n >= 1000 && n % 1000 !== 0) return Number(`${Math.floor(n / 1000) * 1000}${n % 1000}`);
  if (n >= 100 && n % 100 !== 0) return Number(`${Math.floor(n / 100) * 100}${n % 100}`);
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 7) return Number(`60${n - 60}`);
  if (d === 8 && u > 0) return Number(`420${u}`);
  if (d === 9) return Number(`80${n - 80}`);
  return undefined;
}

/** Les zéros intérieurs oubliés : 305 → 35, 2 045 → 245. */
export function zerosOublies(n: number): number | undefined {
  const sans = String(n).replace(/0+(?=\d)/g, (zeros, i) => (i === 0 ? zeros : ''));
  const v = Number(sans);
  return v !== n && sans.length > 0 ? v : undefined;
}

/** Les deux derniers chiffres inversés : 74 → 47, 315 → 351. */
export function chiffresInverses(n: number): number | undefined {
  const s = String(n);
  if (s.length < 2) return undefined;
  const v = Number(`${s.slice(0, -2)}${s[s.length - 1]}${s[s.length - 2]}`);
  return v !== n && s[s.length - 1] !== '0' ? v : undefined;
}

/** Erreurs typiques de numération pour un nombre, de la plus fréquente à la moins fréquente. */
export function erreursDeNumeration(n: number): ErreurNombre[] {
  const erreurs: ErreurNombre[] = [];
  const ajouter = (valeur: number | undefined, erreur: string) => {
    if (valeur !== undefined) erreurs.push({ valeur, erreur });
  };
  ajouter(ecritureJuxtaposee(n), 'nombre écrit morceau par morceau, comme on l’entend');
  ajouter(zerosOublies(n), 'zéro oublié');
  ajouter(chiffresInverses(n), 'chiffres inversés');
  // Le rang voisin du chiffre le plus à gauche : dizaine, centaine, millier de trop ou de moins.
  const rang = 10 ** Math.max(1, String(n).length - 2);
  ajouter(n + rang, 'erreur sur un rang (un de trop)');
  ajouter(n - rang, 'erreur sur un rang (un de moins)');
  return erreurs;
}
