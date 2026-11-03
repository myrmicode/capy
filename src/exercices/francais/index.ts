import type { ModeleTexte } from '../types';

import { accordAdjectif } from './modeles/ce2/accordAdjectif';
import { accordSujetVerbe } from './modeles/ce2/accordSujetVerbe';
import { conjugaison, conjugaisonFutur, conjugaisonImparfait, conjugaisonPresent } from './modeles/ce2/conjugaison';
import { dicteeMots, motsOutils } from './modeles/ce2/dictee';
import { intrus, memeFamille } from './modeles/ce2/familles';
import { memeSens, quiFaitQuoi } from './modeles/ce2/phrasesLues';
import { preuveTexte, questionsTexte, texteEntendu } from './modeles/ce2/texteLu';
import { natureDuMot, trouverLeMot } from './modeles/ce2/natureMots';
import { phraseEnOrdre } from './modeles/ce2/phraseEnOrdre';
import { sujetEtVerbe } from './modeles/ce2/sujetVerbe';
import { synonymes } from './modeles/ce2/synonymes';
import { familleCM2, intrusCM2, phraseEnOrdreCM2, sujetVerbeCM2, synonymesCM2 } from './modeles/cm2';
import { decimaux, fractionPartie } from '../modeles/ecritures';
import { axesSymetrie, compterCotes, reconnaitreFigure } from '../modeles/formes';
import { compterSyllabes, nomLettre, premiereSyllabe, premierSon, syllabeEntendue } from './modeles/cp';
import { comprendreMot, comprendrePhrase } from './modeles/oral';
import { dicteeSyllabes } from './modeles/syllabes';

/** Tous les modèles d'exercices de français. Pour en ajouter un, l'importer ici. */
export const MODELES_FRANCAIS: readonly ModeleTexte[] = [
  accordAdjectif,
  natureDuMot,
  trouverLeMot,
  sujetEtVerbe,
  phraseEnOrdre,
  synonymes,
  memeFamille,
  intrus,
  conjugaisonPresent,
  conjugaisonImparfait,
  conjugaisonFutur,
  conjugaison,
  dicteeMots,
  motsOutils,
  quiFaitQuoi,
  memeSens,
  questionsTexte,
  preuveTexte,
  texteEntendu,
  // CM1 et CM2
  accordSujetVerbe,
  synonymesCM2,
  familleCM2,
  intrusCM2,
  sujetVerbeCM2,
  phraseEnOrdreCM2,
  // CP, à l'oral
  compterSyllabes,
  premiereSyllabe,
  premierSon,
  nomLettre,
  syllabeEntendue,
  // CP et CE1, à l'oral avec des images
  comprendreMot,
  comprendrePhrase,
  // CE1
  dicteeSyllabes,
  // Mathématiques à réponse écrite (fraction, nombre à virgule) : même moteur que le français.
  fractionPartie,
  decimaux,
  // Atelier des formes
  reconnaitreFigure,
  compterCotes,
  axesSymetrie,
];
