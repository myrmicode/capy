/**
 * Compétence visée : écrire sans erreur des mots dictés, réguliers puis porteurs
 * de graphies complexes, de lettres muettes ou de consonnes doubles, et les mots
 * invariables les plus fréquents. Attendus de fin de cycle 2 (CE2) ;
 * axe « Écrire des mots ».
 */
import type { Alea } from '../../../alea';
import type { NiveauDifficulte } from '../../../types';
import {
  explicationDictee,
  explicationDicteeFacile,
  fautesTypiques,
  indiceDictee,
  indiceDicteeFacile,
  MOTS_DICTEE,
  MOTS_OUTILS,
  type MotDictee,
} from '../../dictee';
import { definirModeleTexte, majuscule, NIVEAUX_CE1, NIVEAUX_CM, type ContenuTexte } from '../../moteur';

/** Ce qui remplace le mot dans la phrase affichée. */
export const TROU = '……';

/** Surtout des mots du niveau demandé, parfois un mot plus simple pour se rassurer. */
function choisirMot(alea: Alea, mots: readonly MotDictee[], niveau: NiveauDifficulte): MotDictee {
  const plusSimples = mots.filter((m) => m.niveau < niveau);
  if (plusSimples.length > 0 && alea.entier(0, 3) === 0) return alea.choix(plusSimples);
  return alea.choix(mots.filter((m) => m.niveau === niveau));
}

/** La phrase affichée : le mot est remplacé par un trou, l'enfant ne l'entend que par Capy. */
export function phraseATrou(mot: MotDictee): string {
  return mot.phrase.replace(new RegExp(`(?<!\\p{L})${mot.mot}(?![\\p{L}])`, 'u'), TROU);
}

function dicter(alea: Alea, mot: MotDictee): ContenuTexte {
  return {
    enonce: phraseATrou(mot),
    question: 'Comment s’écrit le mot que dit Capy ?',
    // Comme en classe : le mot, la phrase, puis le mot encore une fois.
    lecture: `${majuscule(mot.mot)}. ${mot.phrase} ${majuscule(mot.mot)}.`,
    reponse: mot.mot,
    distracteurs: alea.melanger(fautesTypiques(mot.mot)),
    indice: indiceDictee(mot),
    explication: explicationDictee(mot),
    facile: {
      question: 'Comment s’écrit le mot de Capy ?',
      indice: indiceDicteeFacile(mot),
      explication: explicationDicteeFacile(mot),
    },
  };
}

export const dicteeMots = definirModeleTexte({
  id: 'dictee-mots',
  titre: 'La dictée de mots',
  domaine: 'ecrire-mots',
  competence: 'Écrire un mot dicté : graphies simples, puis sons complexes et lettres muettes, puis consonnes doubles.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  niveauxParClasse: { CE1: NIVEAUX_CE1, CM1: NIVEAUX_CM, CM2: NIVEAUX_CM },
  // + : chaque son s'écrit simplement ; ++ : sons à plusieurs lettres, lettres muettes ;
  // +++ : consonnes doubles, m devant b et p, h muet.
  construire: (alea, _classe, niveau) => dicter(alea, choisirMot(alea, MOTS_DICTEE, niveau)),
});

export const motsOutils = definirModeleTexte({
  id: 'mots-outils',
  titre: 'Les petits mots à connaître',
  domaine: 'ecrire-mots',
  competence: 'Écrire sans erreur les mots invariables les plus fréquents (avec, toujours, beaucoup…).',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  niveauxParClasse: { CE1: NIVEAUX_CE1, CM1: NIVEAUX_CM, CM2: NIVEAUX_CM },
  // + : mots courts (avec, dans, très) ; ++ : toujours, souvent, déjà ; +++ : beaucoup, aujourd'hui.
  construire: (alea, _classe, niveau) => dicter(alea, choisirMot(alea, MOTS_OUTILS, niveau)),
});
