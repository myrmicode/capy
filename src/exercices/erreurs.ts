// Calculs fautifs qui reproduisent des erreurs fréquentes des élèves.
// Ils servent à fabriquer des distracteurs crédibles.

function chiffres(n: number): number[] {
  return String(n).split('').reverse().map(Number);
}

/** Addition posée en oubliant les retenues : 47 + 38 → 75. */
export function additionSansRetenue(a: number, b: number): number {
  const ca = chiffres(a);
  const cb = chiffres(b);
  let resultat = 0;
  for (let i = 0, rang = 1; i < Math.max(ca.length, cb.length); i++, rang *= 10) {
    resultat += (((ca[i] ?? 0) + (cb[i] ?? 0)) % 10) * rang;
  }
  return resultat;
}

/**
 * Soustraction posée où, dans chaque colonne, on retire le plus petit chiffre
 * du plus grand au lieu de faire une retenue : 52 − 38 → 26.
 */
export function soustractionPetitDuGrand(a: number, b: number): number {
  const ca = chiffres(a);
  const cb = chiffres(b);
  let resultat = 0;
  for (let i = 0, rang = 1; i < ca.length; i++, rang *= 10) {
    resultat += Math.abs((ca[i] ?? 0) - (cb[i] ?? 0)) * rang;
  }
  return resultat;
}

/** Vrai si l'addition posée demande au moins une retenue. */
export function additionAvecRetenue(a: number, b: number): boolean {
  return additionSansRetenue(a, b) !== a + b;
}

/** Vrai si la soustraction posée demande au moins une retenue. */
export function soustractionAvecRetenue(a: number, b: number): boolean {
  return soustractionPetitDuGrand(a, b) !== a - b;
}
