/**
 * Compétence visée : conjuguer au présent, à l'imparfait et au futur de
 * l'indicatif « être », « avoir » et les verbes du premier groupe, en s'appuyant
 * sur les repères de temps et sur le sujet. Attendus de fin de cycle 2 (CE2) ;
 * axe « Mémoriser des temps de conjugaison ».
 */
import {
  AVOIR,
  conjuguer,
  ETRE,
  NOMS_TEMPS,
  PERSONNES,
  pronom,
  REPERES_TEMPS,
  TEMPS,
  TEMPS_AVEC_ARTICLE,
  VERBES_PREMIER_GROUPE,
  type Personne,
  type Temps,
} from '../../conjugaison';
import { definirModeleTexte, NIVEAUX_CM } from '../../moteur';

const INDICES_TEMPS = {
  present: 'Les mots du début disent que l’action se passe maintenant : pense au présent.',
  imparfait: 'Les mots du début disent que l’action se passait avant : pense à l’imparfait.',
  futur: 'Les mots du début disent que l’action va arriver plus tard : pense au futur.',
} as const;

/** Un modèle par temps travaillé (et un qui mélange les trois). */
function conjugaisonDe(id: string, titre: string, tempsPossibles: readonly Temps[]) {
  return definirModeleTexte({
    id,
    titre,
    domaine: 'conjugaison',
    competence: `Conjuguer être, avoir et les verbes du 1er groupe (${tempsPossibles.map((t) => NOMS_TEMPS[t]).join(', ')}).`,
    classes: ['CE2', 'CM1'],
    niveauxParClasse: { CM1: NIVEAUX_CM },
    // + : verbes du 1er groupe, sujets pronoms ; ++ : aussi être et avoir ;
    // +++ : aussi un sujet qui n'est pas un pronom (« Capy »).
    construire: (alea, _classe, niveau) => {
      // Être ou avoir une fois sur trois (à partir de ++), un verbe du 1er groupe sinon.
      const verbe =
        niveau > 1 && alea.entier(0, 2) === 0 ? alea.choix([ETRE, AVOIR]) : alea.choix(VERBES_PREMIER_GROUPE);
      // Pas de « je » avec être et avoir : l'élision (j'ai, j'étais) trahirait la réponse.
      const possibles = verbe === ETRE || verbe === AVOIR ? PERSONNES.filter((p) => p !== 0) : PERSONNES;
      const personne = alea.choix(possibles);
      const temps = alea.choix(tempsPossibles);
      const sujet =
        niveau === 3 && personne === 2 && alea.entier(0, 2) === 0
          ? 'Capy'
          : pronom(personne, alea.choix([true, false]));
      const forme = conjuguer(verbe.infinitif, temps, personne);
      const repere = alea.choix(REPERES_TEMPS[temps]);

      const memeSon = (p: Personne) =>
        temps === 'present' &&
        verbe !== ETRE &&
        verbe !== AVOIR &&
        [0, 1, 2, 5].includes(p) &&
        [0, 1, 2, 5].includes(personne);
      const autresPersonnes = alea.melanger(PERSONNES.filter((p) => p !== personne));
      const distracteurs = [
        // D'abord les terminaisons qui s'entendent pareil (je chante, tu chantes, ils chantent).
        ...autresPersonnes
          .filter(memeSon)
          .map((p) => ({ valeur: conjuguer(verbe.infinitif, temps, p), erreur: 'terminaison qui s’entend pareil' })),
        ...alea.melanger(TEMPS.filter((t) => t !== temps)).map((t) => ({
          valeur: conjuguer(verbe.infinitif, t, personne),
          erreur: `${NOMS_TEMPS[t]} au lieu de ${TEMPS_AVEC_ARTICLE[temps]}`,
        })),
        ...autresPersonnes.map((p) => ({
          valeur: conjuguer(verbe.infinitif, temps, p),
          erreur: 'terminaison d’une autre personne',
        })),
      ];

      return {
        enonce: `${repere}, ${sujet} ___ ${verbe.complement}.`,
        question: `Complète avec le verbe « ${verbe.infinitif} ».`,
        reponse: forme,
        distracteurs,
        indice: `${INDICES_TEMPS[temps]} Observe aussi le sujet : « ${sujet} ».`,
        explication: `« ${repere} » indique ${TEMPS_AVEC_ARTICLE[temps]}. Avec « ${sujet} », le verbe ${verbe.infinitif} s’écrit « ${forme} » : ${repere.toLowerCase()}, ${sujet} ${forme} ${verbe.complement}.`,
      };
    },
  });
}

export const conjugaisonPresent = conjugaisonDe('conjugaison-present', 'Le présent', ['present']);
export const conjugaisonImparfait = conjugaisonDe('conjugaison-imparfait', 'L’imparfait', ['imparfait']);
export const conjugaisonFutur = conjugaisonDe('conjugaison-futur', 'Le futur', ['futur']);
export const conjugaison = conjugaisonDe('conjugaison', 'Les trois temps', TEMPS);
