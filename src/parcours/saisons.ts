// Les saisons, pour habiller le décor du parcours au fil de l'année scolaire
// (saisons météorologiques, plus simples pour un enfant : l'automne commence en septembre).
export type Saison = 'automne' | 'hiver' | 'printemps' | 'ete';

export function saisonDe(d: Date): Saison {
  const mois = d.getMonth() + 1;
  if (mois >= 9 && mois <= 11) return 'automne';
  if (mois === 12 || mois <= 2) return 'hiver';
  if (mois <= 5) return 'printemps';
  return 'ete';
}
