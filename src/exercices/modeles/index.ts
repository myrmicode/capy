import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';

import type { ModeleExercice } from '../types';

import { ajout } from './ce2/ajout';
import { deuxEtapes } from './ce2/deuxEtapes';
import { ecart } from './ce2/ecart';
import { groupements } from './ce2/groupements';
import { partage } from './ce2/partage';
import { retrait } from './ce2/retrait';

/** Tous les modèles d'exercices. Pour en ajouter un, l'importer ici. */
export const MODELES: readonly ModeleExercice[] = [groupements, ajout, retrait, ecart, partage, deuxEtapes];

export function modeleParId(id: string): ModeleExercice | undefined {
  return MODELES.find((m) => m.id === id);
}

export function modelesPour(domaine: DomaineId, classe: Classe): ModeleExercice[] {
  return MODELES.filter((m) => m.domaine === domaine && m.classes.includes(classe));
}
