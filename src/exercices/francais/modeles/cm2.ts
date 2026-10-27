/**
 * Axes propres à la fiche de CM2, qui réunit des compétences séparées en CM1 :
 * - « Reconnaître des synonymes et des mots de la même famille » ;
 * - « Repérer le sujet, le verbe et le complément ».
 * Les exercices sont ceux du CM1 (déjà au niveau le plus exigeant), rattachés à
 * l'axe de la fiche de CM2 pour que la toile avance au bon endroit.
 */
import { reprendreModele } from '../moteur';

import { intrus, memeFamille } from './ce2/familles';
import { phraseEnOrdre } from './ce2/phraseEnOrdre';
import { sujetEtVerbe } from './ce2/sujetVerbe';
import { synonymes } from './ce2/synonymes';

export const synonymesCM2 = reprendreModele(synonymes, {
  id: 'synonymes-cm2',
  titre: 'Les synonymes',
  domaine: 'synonymes-familles',
  classes: ['CM2'],
});
export const familleCM2 = reprendreModele(memeFamille, {
  id: 'meme-famille-cm2',
  titre: 'La même famille',
  domaine: 'synonymes-familles',
  classes: ['CM2'],
});
export const intrusCM2 = reprendreModele(intrus, {
  id: 'intrus-famille-cm2',
  titre: 'L’intrus',
  domaine: 'synonymes-familles',
  classes: ['CM2'],
});

export const sujetVerbeCM2 = reprendreModele(sujetEtVerbe, {
  id: 'sujet-et-verbe-cm2',
  titre: 'Le sujet et le verbe',
  domaine: 'sujet-verbe-complement',
  classes: ['CM2'],
});
export const phraseEnOrdreCM2 = reprendreModele(phraseEnOrdre, {
  id: 'phrase-en-ordre-cm2',
  titre: 'La phrase en désordre',
  domaine: 'sujet-verbe-complement',
  classes: ['CM2'],
});
