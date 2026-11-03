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
import { foisDixCent } from './ce2/foisDixCent';
import { groupements } from './ce2/groupements';
import { lireGrandsPas, lirePetitsPas, placerGrandsPas, placerPetitsPas } from './ce2/ligneGraduee';
import { payer, rendreMonnaie } from './ce2/monnaie';
import { partage } from './ce2/partage';
import { retrait } from './ce2/retrait';
import { tables, tablesMultiplication } from './ce2/tables';
import { tablesAddition } from './ce2/tablesAddition';
import { additionPosee, fractionDe, multiplicationPosee, soustractionPosee } from './calculsPoses';
import {
  heuresEnMinutes,
  kilogrammesEnGrammes,
  kilometresEnMetres,
  litresEnCentilitres,
  mesurerRegle,
  metresEnCentimetres,
} from './mesures';
import { proportionnalite } from './proportionnalite';
import { compterObjets, decomposer, denombrer, ecrireNombre, lireNombre, plusGrand, plusPetit } from './nombres';

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
  proportionnalite,
  // Calcul mental
  tables,
  doubles,
  complementCent,
  ajouterDizaines,
  foisDixCent,
  // Numération
  compterObjets,
  lireNombre,
  ecrireNombre,
  plusGrand,
  plusPetit,
  denombrer,
  decomposer,
  // Poser et calculer, fractions
  additionPosee,
  soustractionPosee,
  multiplicationPosee,
  fractionDe,
  // Mesures
  mesurerRegle,
  metresEnCentimetres,
  kilometresEnMetres,
  kilogrammesEnGrammes,
  litresEnCentilitres,
  heuresEnMinutes,
  // Tables
  tablesAddition,
  tablesMultiplication,
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
