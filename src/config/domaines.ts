import type { Classe } from './classes';

// Axes de la toile par classe. PROVISOIRES : à caler sur une vraie fiche de
// l'école. Le reste de l'appli lit cette configuration, rien n'est codé en dur ailleurs.

export type DomaineId =
  | 'nombres'
  | 'ligne-graduee'
  | 'calcul-mental'
  | 'calcul-en-ligne'
  | 'resoudre-problemes'
  | 'geometrie';

export interface Domaine {
  id: DomaineId;
  libelle: string;
}

const DOMAINES_CE2: Domaine[] = [
  { id: 'nombres', libelle: 'Nombres' },
  { id: 'ligne-graduee', libelle: 'Ligne graduée' },
  { id: 'calcul-mental', libelle: 'Calcul mental' },
  { id: 'calcul-en-ligne', libelle: 'Calcul en ligne' },
  { id: 'resoudre-problemes', libelle: 'Résoudre des problèmes' },
  { id: 'geometrie', libelle: 'Géométrie' },
];

// Les autres classes reprennent les axes de CE2 en attendant leurs vraies fiches.
export const DOMAINES_PAR_CLASSE: Record<Classe, Domaine[]> = {
  CP: DOMAINES_CE2,
  CE1: DOMAINES_CE2,
  CE2: DOMAINES_CE2,
  CM1: DOMAINES_CE2,
  CM2: DOMAINES_CE2,
};

export function domainesDe(classe: Classe): Domaine[] {
  return DOMAINES_PAR_CLASSE[classe];
}
