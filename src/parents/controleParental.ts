// Contrôle parental : un nombre écrit en lettres (entre 1 000 et 99 999), à taper
// en chiffres. Un enfant de 5 à 9 ans ne le lit pas facilement, un adulte si.
// Pas de blocage après une erreur : on propose simplement un autre nombre.
import type { Alea } from '@/exercices';
import { nombreEnLettres } from '@/exercices/nombres';

export { nombreEnLettres };

export interface DefiParental {
  enLettres: string;
  reponse: string;
}

export function nouveauDefi(alea: Alea): DefiParental {
  const n = alea.entier(1_000, 99_999);
  return { enLettres: nombreEnLettres(n), reponse: String(n) };
}
