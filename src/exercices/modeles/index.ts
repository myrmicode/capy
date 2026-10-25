import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';

import { MODELES_FRANCAIS } from '../francais';
import type { ModeleExercice, ModeleQuelconque, ModeleTexte } from '../types';

import { ajout } from './ce2/ajout';
import { ajouterDizaines } from './ce2/ajouterDizaines';
import { complementCent } from './ce2/complementCent';
import { deuxEtapes } from './ce2/deuxEtapes';
import { doubles } from './ce2/doubles';
import { duree } from './ce2/duree';
import { ecart } from './ce2/ecart';
import { groupements } from './ce2/groupements';
import { lireGrandsPas, lirePetitsPas, placerGrandsPas, placerPetitsPas } from './ce2/ligneGraduee';
import { payer, rendreMonnaie } from './ce2/monnaie';
import { partage } from './ce2/partage';
import { retrait } from './ce2/retrait';
import { tables } from './ce2/tables';

/** Tous les modèles d'exercices. Pour en ajouter un, l'importer ici. */
export const MODELES: readonly ModeleExercice[] = [
  // Résoudre des problèmes
  groupements,
  ajout,
  retrait,
  ecart,
  partage,
  deuxEtapes,
  payer,
  rendreMonnaie,
  duree,
  // Calcul mental
  tables,
  doubles,
  complementCent,
  ajouterDizaines,
  // Ligne graduée
  placerPetitsPas,
  placerGrandsPas,
  lirePetitsPas,
  lireGrandsPas,
];

export function modeleParId(id: string): ModeleExercice | undefined {
  return MODELES.find((m) => m.id === id);
}

export function modeleTexteParId(id: string): ModeleTexte | undefined {
  return MODELES_FRANCAIS.find((m) => m.id === id);
}

/** Modèles (mathématiques et français) qui travaillent un axe de la toile pour une classe. */
export function modelesPour(domaine: DomaineId, classe: Classe): ModeleQuelconque[] {
  return [...MODELES, ...MODELES_FRANCAIS].filter((m) => m.domaine === domaine && m.classes.includes(classe));
}
