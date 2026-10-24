import type { ModeleTexte } from '../types';

import { accordAdjectif } from './modeles/ce2/accordAdjectif';
import { conjugaison, conjugaisonFutur, conjugaisonImparfait, conjugaisonPresent } from './modeles/ce2/conjugaison';
import { dicteeMots, motsOutils } from './modeles/ce2/dictee';
import { intrus, memeFamille } from './modeles/ce2/familles';
import { natureDuMot, trouverLeMot } from './modeles/ce2/natureMots';
import { sujetEtVerbe } from './modeles/ce2/sujetVerbe';
import { synonymes } from './modeles/ce2/synonymes';

/** Tous les modèles d'exercices de français. Pour en ajouter un, l'importer ici. */
export const MODELES_FRANCAIS: readonly ModeleTexte[] = [
  accordAdjectif,
  natureDuMot,
  trouverLeMot,
  sujetEtVerbe,
  synonymes,
  memeFamille,
  intrus,
  conjugaisonPresent,
  conjugaisonImparfait,
  conjugaisonFutur,
  conjugaison,
  dicteeMots,
  motsOutils,
];
