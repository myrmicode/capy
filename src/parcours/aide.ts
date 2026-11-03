// Aide progressive après une erreur. Plus l'enfant cherche, plus Capy l'aide,
// sans jamais le punir :
// 1. un indice qui rappelle la règle, et qui fait relire la question quand elle a
//    des mots importants (« en tout », « le plus », « pas ») ;
// 2. moins de réponses proposées (deux seulement), quand le mini-jeu s'y prête ;
// 3. l'explication de la méthode, comme un exemple résolu, puis l'enfant répond.

/** À partir de combien d'essais ratés Capy enlève des réponses. */
import { relireLaQuestion } from '@/accessibilite/motsCles';

export const ESSAIS_AVANT_CHOIX_REDUITS = 2;

export interface AideApresErreur {
  indice: string;
  /** Capy a enlevé des réponses pour le prochain essai. */
  choixReduits: boolean;
  /** Explication de la méthode, montrée quand l'indice et le choix réduit n'ont pas suffi. */
  methode?: string;
}

/**
 * @param essaisRates Erreurs sur la question en cours (au moins 1 après « Presque »).
 * @param peutReduire Le mini-jeu peut-il proposer moins de réponses au prochain essai ?
 */
export function aideApresErreur(
  essaisRates: number,
  {
    indice,
    explication,
    peutReduire,
    question,
  }: { indice: string; explication: string; peutReduire: boolean; question?: string },
): AideApresErreur {
  if (essaisRates < ESSAIS_AVANT_CHOIX_REDUITS) {
    // Après la première erreur, on relit d'abord la question : beaucoup d'erreurs viennent de là.
    const relire = question ? relireLaQuestion(question) : null;
    return { indice: relire ? `${relire} ${indice}` : indice, choixReduits: false };
  }
  // Le choix réduit vient d'abord ; s'il n'existe pas pour ce jeu, ou n'a pas suffi, l'explication.
  if (essaisRates === ESSAIS_AVANT_CHOIX_REDUITS && peutReduire) return { indice, choixReduits: true };
  return { indice, choixReduits: false, methode: explication };
}
