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
