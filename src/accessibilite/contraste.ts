// Rapport de contraste WCAG 2.1 entre deux couleurs hexadécimales (#rrggbb).

function luminance(hex: string): number {
  const canaux = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canaux.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function rapportContraste(couleurA: string, couleurB: string): number {
  const [claire, foncee] = [luminance(couleurA), luminance(couleurB)].sort((a, b) => b - a);
  return (claire + 0.05) / (foncee + 0.05);
}

/** Assombrit une couleur (#rrggbb) d'une fraction entre 0 et 1, vers le noir. */
export function assombrir(hex: string, fraction: number): string {
  const canaux = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - fraction)));
  return `#${canaux.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** La couleur la plus proche de celle demandée qui atteint le contraste voulu sur tous ces fonds. */
export function couleurLisible(hex: string, fonds: readonly string[], minimum = 4.5): string {
  let couleur = hex;
  for (let pas = 1; pas <= 40 && fonds.some((f) => rapportContraste(couleur, f) < minimum); pas++) {
    couleur = assombrir(hex, pas * 0.02);
  }
  return couleur;
}
